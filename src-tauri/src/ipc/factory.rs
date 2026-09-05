/*!
 * SOURCE OF TRUTH KEYWORDS: execute, CommandSpec, Reentrancy, Validate,
 *   ValidationError, murmur_command, preflight_permissions
 * WHAT:  The command factory. Every IPC command runs through `execute`, which
 *        validates the input, preflights permissions, guards reentrancy, opens
 *        a tracing span, runs the handler, and maps whatever comes back to an
 *        AppError.
 * WHY:   This is the analog of a protected procedure, and it exists so those
 *        six concerns have ONE implementation instead of one per handler. A
 *        permission check written thirty times is a permission check that is
 *        wrong in three places; a validation step a handler can forget is a
 *        validation step that will be forgotten.
 *
 *        The corollary is the rule that matters when writing a handler: do NOT
 *        re-check any of it. If a handler is checking a permission, the
 *        capability's `requires` list in the registry is wrong, and that is
 *        where the fix belongs.
 * WHERE: Called by every function in ipc/commands/. Reads capability metadata
 *        from registry/.
 */

use std::future::Future;

use crate::error::{AppError, AppResult, ErrorCode, ErrorAction, PrivacyPane};
use crate::ports::permissions::{OsPermission, PermissionState};
use crate::registry::{self, CapabilityKey};

use super::context::{AppState, CommandContext};

/**
 * SOURCE OF TRUTH KEYWORDS: Validate, ValidationError
 * WHAT:  The contract every command input implements.
 * WHY:   Rust has no Zod, so validation is a trait the factory calls rather
 *        than a schema it interprets. The effect is the same and the guarantee
 *        is stronger: an input type that does not implement this cannot be used
 *        as a command input at all, so "someone forgot to validate" is a
 *        compile error rather than a code review.
 * WHERE: Implemented by every input struct in ipc/commands/.
 */
pub trait Validate {
    /// Return a user-facing reason. The factory turns it into an AppError.
    fn validate(&self) -> Result<(), String>;
}

/// Inputs with nothing to check still opt in explicitly, so the absence of a
/// check is a decision someone made rather than one nobody made.
impl Validate for () {
    fn validate(&self) -> Result<(), String> {
        Ok(())
    }
}

/**
 * SOURCE OF TRUTH KEYWORDS: Reentrancy
 * WHAT:  Whether concurrent calls to this command are allowed.
 * WHY:   Reads are safe to overlap and should not be serialised — a dashboard
 *        opening three panels at once must not queue. Anything that mutates
 *        session state is Exclusive, which is what makes a double-fired hotkey
 *        harmless.
 * WHERE: Declared per command in its CommandSpec.
 */
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Reentrancy {
    /// One at a time per capability.
    Exclusive,
    /// Overlapping calls are fine.
    Concurrent,
}

/**
 * SOURCE OF TRUTH KEYWORDS: ResourceUse, Acquires, Reports
 * WHAT:  Whether a command actually touches the OS resources its capability
 *        declares, or merely reports on them.
 * WHY:   A capability's `requires` list describes what the FEATURE needs — the
 *        microphone, for dictation. It does not follow that every command on
 *        that capability needs it. `get_session_state` only reads what the FSM
 *        is doing, and preflighting it against the microphone meant the pill
 *        could not render its own idle state until permission was granted:
 *        the app looked broken in exactly the moment it was trying to explain
 *        how to fix it.
 *
 *        So the requirement is enforced where the resource is USED. Acquires is
 *        the default, because defaulting to "no permission needed" would let a
 *        new command quietly skip a check nobody notices is missing.
 * WHERE: Declared per command in its CommandSpec; read by preflight_permissions.
 */
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ResourceUse {
    /// Uses the capability's OS resources. Preflight applies. The default.
    Acquires,
    /// Only reports on them. No OS resource is touched, so no grant is needed.
    Reports,
}

/**
 * SOURCE OF TRUTH KEYWORDS: CommandSpec
 * WHAT:  The declaration a command hands the factory.
 * WHERE: One per function in ipc/commands/.
 */
#[derive(Debug, Clone, Copy)]
pub struct CommandSpec {
    /// Used in the tracing span and in errors.
    pub name: &'static str,
    /// Which registry entry governs this command's permissions.
    pub capability: CapabilityKey,
    pub reentrancy: Reentrancy,
    pub resource_use: ResourceUse,
}

impl CommandSpec {
    pub const fn new(name: &'static str, capability: CapabilityKey) -> Self {
        Self {
            name,
            capability,
            reentrancy: Reentrancy::Concurrent,
            resource_use: ResourceUse::Acquires,
        }
    }

    pub const fn exclusive(mut self) -> Self {
        self.reentrancy = Reentrancy::Exclusive;
        self
    }

    /// This command only reads state; it needs no OS grant. See ResourceUse.
    pub const fn reports(mut self) -> Self {
        self.resource_use = ResourceUse::Reports;
        self
    }
}

/**
 * SOURCE OF TRUTH KEYWORDS: execute
 * WHAT:  Runs one command through every cross-cutting concern.
 * WHY:   The order is deliberate and each step depends on the one before it:
 *          1. Validate  — an invalid input must never reach a handler, and must
 *                         never cost a permission prompt or a lock.
 *          2. Preflight — a missing OS grant becomes a typed, actionable error
 *                         rather than a panic deep inside an adapter.
 *          3. Guard     — claimed only after we know the call is legal, so an
 *                         invalid call cannot lock out a valid one.
 *          4. Handler   — business logic, and nothing else.
 *          5. Map       — one error surface for the UI.
 * WHERE: Called by every command in ipc/commands/.
 */
pub async fn execute<R, I, O, F, Fut>(
    state: &AppState<R>,
    spec: CommandSpec,
    input: I,
    handler: F,
) -> Result<O, AppError>
where
    R: tauri::Runtime,
    I: Validate,
    F: FnOnce(CommandContext<R>, I) -> Fut,
    Fut: Future<Output = AppResult<O>>,
{
    let correlation_id = uuid::Uuid::new_v4().to_string();
    let span = tracing::info_span!(
        "command",
        name = spec.name,
        capability = spec.capability.as_str(),
        correlation_id = %correlation_id,
    );
    let _entered = span.enter();

    // 1. Validation. The input schema is the source of truth.
    if let Err(reason) = input.validate() {
        tracing::warn!(reason = %reason, "command validation rejected");
        return Err(AppError::invalid_input(reason));
    }

    // 2. Permission preflight, straight from the registry declaration — but
    // only for commands that actually use the resource. See ResourceUse.
    if spec.resource_use == ResourceUse::Acquires {
        if let Err(err) = preflight_permissions(state, spec.capability) {
            tracing::warn!(
                code = ?err.code,
                message = %err.message,
                detail = ?err.detail,
                "command preflight failed"
            );
            return Err(err);
        }
    }

    // 3. Reentrancy. Held for the life of the call, released on any exit.
    let _guard = match spec.reentrancy {
        Reentrancy::Exclusive => match state.begin_exclusive(spec.capability) {
            Some(guard) => Some(guard),
            None => {
                tracing::warn!("command reentrant call rejected");
                return Err(AppError::new(
                    ErrorCode::SessionAlreadyActive,
                    "That is already in progress.",
                )
                .recoverable());
            }
        },
        Reentrancy::Concurrent => None,
    };

    // 4. The handler. Only what is specific to this task.
    let context = CommandContext {
        state: state.clone(),
        correlation_id: correlation_id.clone(),
    };

    let started = std::time::Instant::now();
    let outcome = handler(context, input).await;
    let elapsed_ms = started.elapsed().as_secs_f64() * 1000.0;

    // 5. One error surface. The command factory is the sole logger for all
    // command-level errors and timings. Handlers return AppError directly.
    match &outcome {
        Ok(_) => tracing::info!(elapsed_ms, "ok"),
        Err(err) => tracing::error!(
            elapsed_ms,
            code = ?err.code,
            message = %err.message,
            detail = ?err.detail,
            "command failed"
        ),
    }

    outcome
}

/**
 * SOURCE OF TRUTH KEYWORDS: preflight_permissions
 * WHAT:  Checks every OS grant the capability declares it requires.
 * WHY:   Reads `capability.requires` rather than a hardcoded list, so adding a
 *        permission to a feature is a registry edit and nothing else. The error
 *        it produces carries the deep link into the right settings pane —
 *        which is the ONLY recovery once a user has denied a TCC prompt, since
 *        macOS never asks twice.
 * WHERE: Step 2 of execute.
 */
fn preflight_permissions<R: tauri::Runtime>(state: &AppState<R>, key: CapabilityKey) -> AppResult<()> {
    let Some(capability) = registry::capability(key) else {
        // A command naming a capability that is not declared is a wiring bug,
        // not a user problem — fail loudly rather than running unprotected.
        return Err(AppError::internal(format!(
            "command declared capability `{}`, which is not in the registry",
            key.as_str()
        )));
    };

    for permission in &capability.requires {
        // `ensure`, not `check`. A capability declaring a permission is about
        // to USE it, and the honest response to "never asked" is to ask — see
        // the WHY on PermissionProvider::ensure for what using `check` here
        // cost us.
        let state = state.ports.permissions.ensure(*permission);
        if state.is_granted() {
            continue;
        }

        tracing::warn!(permission = ?permission, state = ?state, "preflight failed");
        return Err(match (permission, state) {
            // Asked, and the dialog is still on screen. The remedy is to answer
            // it and try again — NOT a trip to System Settings, which would not
            // list Murmur yet.
            (OsPermission::Microphone, PermissionState::NotDetermined) => {
                AppError::microphone_pending()
            }
            (OsPermission::Microphone, _) => AppError::microphone_denied(),
            (OsPermission::Accessibility, _) => AppError::accessibility_denied(),
        });
    }

    Ok(())
}

/// Builds the deep-link error for a permission without failing a command —
/// used by onboarding, which reports state rather than refusing to run.
pub fn permission_action(permission: OsPermission) -> ErrorAction {
    ErrorAction::OpenPrivacyPane {
        pane: match permission {
            OsPermission::Microphone => PrivacyPane::Microphone,
            OsPermission::Accessibility => PrivacyPane::Accessibility,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Input {
        value: i64,
    }

    impl Validate for Input {
        fn validate(&self) -> Result<(), String> {
            if self.value < 0 {
                return Err("Value must not be negative.".into());
            }
            Ok(())
        }
    }

    #[test]
    fn validation_rejects_before_anything_else_happens() {
        let input = Input { value: -1 };
        assert!(input.validate().is_err());

        let input = Input { value: 3 };
        assert!(input.validate().is_ok());
    }

    #[test]
    fn a_spec_acquires_resources_unless_it_says_otherwise() {
        // Defaulting to Acquires matters: a new command that forgets to declare
        // its resource use gets the CHECK, not a silent bypass.
        let default = CommandSpec::new("start_recording", CapabilityKey::Dictation);
        assert_eq!(default.resource_use, ResourceUse::Acquires);

        let query = CommandSpec::new("get_session_state", CapabilityKey::Dictation).reports();
        assert_eq!(query.resource_use, ResourceUse::Reports);
    }

    #[test]
    fn a_spec_is_concurrent_unless_it_says_otherwise() {
        let read = CommandSpec::new("list_history", CapabilityKey::History);
        assert_eq!(read.reentrancy, Reentrancy::Concurrent);

        let write = CommandSpec::new("start_recording", CapabilityKey::Dictation).exclusive();
        assert_eq!(write.reentrancy, Reentrancy::Exclusive);
    }

    #[test]
    fn every_capability_a_command_can_name_exists_in_the_registry() {
        // preflight fails closed on an unknown capability, so this guards the
        // wiring rather than the runtime.
        for key in [
            CapabilityKey::Dictation,
            CapabilityKey::History,
            CapabilityKey::Stats,
            CapabilityKey::Dictionary,
            CapabilityKey::Models,
            CapabilityKey::Settings,
            CapabilityKey::Onboarding,
            CapabilityKey::Updates,
        ] {
            assert!(
                registry::capability(key).is_some(),
                "capability `{}` is named but not declared",
                key.as_str()
            );
        }
    }

    #[test]
    fn permission_errors_carry_the_recovery_deep_link() {
        // A denied TCC grant can never be re-prompted, so the error is useless
        // without the link.
        let err = AppError::microphone_denied();
        assert!(matches!(
            err.action,
            Some(ErrorAction::OpenPrivacyPane {
                pane: PrivacyPane::Microphone
            })
        ));

        let err = AppError::accessibility_denied();
        assert!(err.recoverable, "the app still works without Accessibility");
    }

    // ── Integration tests for execute end-to-end through a test AppHandle ───

    use std::sync::Arc;
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::path::PathBuf;
    use tauri::Manager;
    use crate::config::AppPaths;
    use crate::db::Database;
    use crate::error::ErrorCode;
    use crate::ipc::context::{Ports, SessionHandle};
    use crate::ports::{
        AudioSource, EventSink, ModelStore, PermissionProvider, TextInjector,
        TranscriptionEngine,
    };

    struct DummyEngine;
    impl TranscriptionEngine for DummyEngine {
        fn capabilities(&self) -> crate::types::EngineCapabilities {
            crate::types::EngineCapabilities {
                id: crate::types::EngineId("dummy".into()),
                display_name: "Dummy".into(),
                languages: crate::types::LanguageSupport::All,
                features: vec![],
                realtime_factor: 1.0,
                requires_download: false,
                runs_offline: true,
            }
        }
        fn prepare(&self) -> AppResult<()> {
            Ok(())
        }
        fn is_ready(&self) -> bool {
            true
        }
        fn transcribe(
            &self,
            _chunk: &crate::types::AudioChunk,
            _request: &crate::ports::engine::TranscribeRequest,
        ) -> AppResult<Vec<crate::types::TranscriptSegment>> {
            Ok(vec![])
        }
    }

    struct DummySession;
    impl crate::ports::audio::CaptureSession for DummySession {
        fn device(&self) -> &crate::types::DeviceInfo {
            static INFO: once_cell::sync::Lazy<crate::types::DeviceInfo> = once_cell::sync::Lazy::new(|| {
                crate::types::DeviceInfo {
                    id: "dummy".into(),
                    name: "Dummy".into(),
                    is_default: true,
                    sample_rate: 16000,
                    channels: 1,
                }
            });
            &INFO
        }
        fn native_sample_rate(&self) -> u32 {
            16000
        }
        fn stop(self: Box<Self>) -> AppResult<()> {
            Ok(())
        }
    }

    struct DummyAudio;
    impl AudioSource for DummyAudio {
        fn list_devices(&self) -> AppResult<Vec<crate::types::DeviceInfo>> {
            Ok(vec![])
        }
        fn default_device(&self) -> AppResult<crate::types::DeviceInfo> {
            Ok(crate::types::DeviceInfo {
                id: "dummy".into(),
                name: "Dummy".into(),
                is_default: true,
                sample_rate: 16000,
                channels: 1,
            })
        }
        fn start(
            &self,
            _config: &crate::ports::audio::CaptureConfig,
            _sink: crate::ports::audio::SampleSender,
        ) -> AppResult<Box<dyn crate::ports::audio::CaptureSession>> {
            Ok(Box::new(DummySession))
        }
    }

    struct DummyInjector;
    impl TextInjector for DummyInjector {
        fn can_inject(&self) -> bool {
            true
        }
        fn frontmost_app(&self) -> Option<crate::ports::injector::FrontmostApp> {
            None
        }
        fn deliver(
            &self,
            _request: &crate::ports::injector::InjectionRequest,
        ) -> AppResult<crate::ports::injector::InjectionOutcome> {
            Ok(crate::ports::injector::InjectionOutcome {
                delivery: crate::types::DeliveryKind::Pasted,
                reason: None,
                clipboard_write_ms: 0.1,
            })
        }
    }

    struct DummyModelStore;
    #[async_trait::async_trait]
    impl ModelStore for DummyModelStore {
        async fn list(&self) -> AppResult<Vec<crate::ports::models::ModelStatus>> {
            Ok(vec![])
        }
        async fn status(&self, id: &crate::types::ModelId) -> AppResult<crate::ports::models::ModelStatus> {
            Err(AppError::not_found(id.as_str()))
        }
        async fn ensure(&self, _id: &crate::types::ModelId) -> AppResult<PathBuf> {
            Err(AppError::not_found("model"))
        }
        async fn verify(&self, _id: &crate::types::ModelId) -> AppResult<bool> {
            Ok(true)
        }
        async fn delete(&self, _id: &crate::types::ModelId) -> AppResult<()> {
            Ok(())
        }
    }

    struct DummyEvents;
    impl EventSink for DummyEvents {
        fn audio_level(&self, _level: crate::types::AudioLevel) {}
        fn transcript_delivered(&self, _word_count: u32, _delivery: crate::types::DeliveryKind) {}
        fn session_state_changed(&self, _state: &crate::types::SessionState) {}
        fn set_pill_visible(&self, _visible: bool) {}
        fn download_progress(&self, _progress: crate::types::DownloadProgress) {}
        fn partial_transcript(&self, _text: &str) {}
        fn backtrack_occurred(&self, _message: &str) {}
        fn set_cancel_key_active(&self, _active: bool) {}
        fn model_state_changed(&self, _model_id: crate::types::ModelId, _state: crate::types::ModelState) {}
    }

    struct MockPermissions {
        mic: PermissionState,
        a11y: PermissionState,
    }

    impl PermissionProvider for MockPermissions {
        fn check(&self, permission: OsPermission) -> PermissionState {
            match permission {
                OsPermission::Microphone => self.mic,
                OsPermission::Accessibility => self.a11y,
            }
        }
        fn request(&self, permission: OsPermission) -> AppResult<PermissionState> {
            Ok(self.check(permission))
        }
        fn open_privacy_pane(&self, _pane: PrivacyPane) -> AppResult<()> {
            Ok(())
        }
    }

    fn build_test_app(
        permissions: Arc<dyn PermissionProvider>,
    ) -> (
        tauri::App<tauri::test::MockRuntime>,
        AppState<tauri::test::MockRuntime>,
    ) {
        let app = tauri::test::mock_app();
        let handle = app.handle().clone();
        let db = Database::open_in_memory().expect("in memory database");
        let (event_tx, _event_rx) = tokio::sync::mpsc::channel(16);
        let session = SessionHandle::new(event_tx);
        let paths = AppPaths {
            data_dir: PathBuf::from("/test/data"),
            models_dir: PathBuf::from("/test/models"),
            logs_dir: PathBuf::from("/test/logs"),
            audio_dir: PathBuf::from("/test/audio"),
            db_path: PathBuf::from(":memory:"),
            bundled_models_dir: None,
        };
        let ports = Ports {
            engine: Arc::new(DummyEngine),
            audio: Arc::new(DummyAudio),
            enhancer: Arc::new(crate::adapters::rules::RuleEnhancer::new()),
            injector: Arc::new(DummyInjector),
            models: Arc::new(DummyModelStore),
            permissions,
            events: Arc::new(DummyEvents),
        };
        let state = AppState::new(paths, db, ports, session, handle);
        app.manage(state.clone());
        (app, state)
    }

    #[tokio::test]
    async fn integration_validation_preempts_permissions_and_handler() {
        let permissions = Arc::new(MockPermissions {
            mic: PermissionState::Denied,
            a11y: PermissionState::Denied,
        });
        let (_app, state) = build_test_app(permissions);
        let spec = CommandSpec::new("test_command", CapabilityKey::Dictation);
        let handler_ran = Arc::new(AtomicBool::new(false));
        let ran = Arc::clone(&handler_ran);

        // Invalid input (-10) should fail validation immediately.
        let result = execute(&state, spec, Input { value: -10 }, |_ctx, _inp| async move {
            ran.store(true, Ordering::SeqCst);
            Ok("unreachable")
        })
        .await;

        assert!(result.is_err());
        let err = result.unwrap_err();
        assert_eq!(err.code, ErrorCode::InvalidInput);
        assert!(!handler_ran.load(Ordering::SeqCst), "handler must not run on validation failure");
    }

    #[tokio::test]
    async fn integration_permission_preflight_blocks_when_denied() {
        let permissions = Arc::new(MockPermissions {
            mic: PermissionState::Denied,
            a11y: PermissionState::Granted,
        });
        let (_app, state) = build_test_app(permissions);
        let spec = CommandSpec::new("start_dictation", CapabilityKey::Dictation);
        let handler_ran = Arc::new(AtomicBool::new(false));
        let ran = Arc::clone(&handler_ran);

        let result = execute(&state, spec, Input { value: 42 }, |_ctx, _inp| async move {
            ran.store(true, Ordering::SeqCst);
            Ok("unreachable")
        })
        .await;

        assert!(result.is_err());
        let err = result.unwrap_err();
        assert_eq!(err.code, ErrorCode::MicrophoneDenied);
        assert!(matches!(err.action, Some(ErrorAction::OpenPrivacyPane { pane: PrivacyPane::Microphone })));
        assert!(!handler_ran.load(Ordering::SeqCst), "handler must not run when permissions are denied");
    }

    #[tokio::test]
    async fn integration_permission_preflight_bypassed_for_reports() {
        let permissions = Arc::new(MockPermissions {
            mic: PermissionState::Denied,
            a11y: PermissionState::Denied,
        });
        let (_app, state) = build_test_app(permissions);
        // .reports() should skip permission preflight even on Dictation
        let spec = CommandSpec::new("get_dictation_state", CapabilityKey::Dictation).reports();
        let handler_ran = Arc::new(AtomicBool::new(false));
        let ran = Arc::clone(&handler_ran);

        let result = execute(&state, spec, Input { value: 10 }, |_ctx, _inp| async move {
            ran.store(true, Ordering::SeqCst);
            Ok("reports_ok")
        })
        .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "reports_ok");
        assert!(handler_ran.load(Ordering::SeqCst), "handler should run when spec declares reports()");
    }

    #[tokio::test]
    async fn integration_exclusive_command_guards_reentrancy() {
        let permissions = Arc::new(MockPermissions {
            mic: PermissionState::Granted,
            a11y: PermissionState::Granted,
        });
        let (_app, state) = build_test_app(permissions);
        let spec = CommandSpec::new("exclusive_op", CapabilityKey::Dictation).exclusive();

        let state_clone = state.clone();
        let result = execute(&state, spec, Input { value: 1 }, |_ctx, _inp| async move {
            // Inside the exclusive execution, attempt another exclusive call for the same capability.
            let nested_spec = CommandSpec::new("nested_exclusive_op", CapabilityKey::Dictation).exclusive();
            let nested_res = execute(&state_clone, nested_spec, Input { value: 2 }, |_c, _i| async move {
                Ok("nested_ok")
            })
            .await;

            assert!(nested_res.is_err());
            let err = nested_res.unwrap_err();
            assert_eq!(err.code, ErrorCode::SessionAlreadyActive);

            Ok("primary_ok")
        })
        .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "primary_ok");

        // Once the first exclusive call has finished, a new exclusive call should succeed.
        let follow_up = execute(&state, spec, Input { value: 3 }, |_ctx, _inp| async move {
            Ok("follow_up_ok")
        })
        .await;
        assert!(follow_up.is_ok());
        assert_eq!(follow_up.unwrap(), "follow_up_ok");
    }

    #[tokio::test]
    async fn integration_end_to_end_through_managed_app_handle() {
        let permissions = Arc::new(MockPermissions {
            mic: PermissionState::Granted,
            a11y: PermissionState::Granted,
        });
        let (app, _state) = build_test_app(permissions);

        // Retrieve the state through Tauri's app handle managed state
        let managed_state = app.state::<AppState<tauri::test::MockRuntime>>();
        let spec = CommandSpec::new("managed_cmd", CapabilityKey::History);

        let result = execute(&managed_state, spec, Input { value: 100 }, |ctx, inp| async move {
            assert!(!ctx.correlation_id.is_empty());
            assert_eq!(ctx.paths().data_dir, PathBuf::from("/test/data"));
            Ok(inp.value * 2)
        })
        .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 200);
    }
}
