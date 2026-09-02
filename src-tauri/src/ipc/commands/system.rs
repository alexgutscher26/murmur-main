/*!
 * SOURCE OF TRUTH KEYWORDS: check_permissions, request_permission,
 *   open_privacy_pane, list_input_devices, PermissionReport, wipe_all_data
 * WHAT:  OS permission state, the one-shot request, the settings deep link,
 *        the input device list, and the full data wipe for remote/manual wipe.
 * WHY:   These deliberately do NOT go through a capability that requires the
 *        permission they are reporting on — a command that needs the microphone
 *        in order to tell you the microphone is denied would be useless. They
 *        report state; they never refuse.
 * WHERE: Consumed by onboarding, the permission empty-states, and the
 *        Privacy section of Settings.
 */

use tauri::{Manager, State};

use crate::error::AppError;
use crate::ipc::context::AppState;
use crate::ipc::factory::{execute, CommandSpec, Validate};
use crate::ports::permissions::{OsPermission, PermissionState};
use crate::registry::CapabilityKey;
use crate::services;
use crate::types::DeviceInfo;

// PartialEq so the permission watcher can emit only on CHANGE rather than
// pushing an identical report every second. See bootstrap::watch_permissions.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize, specta::Type)]
pub struct PermissionReport {
    pub permission: OsPermission,
    pub state: PermissionState,
}

const CHECK: CommandSpec = CommandSpec::new("check_permissions", CapabilityKey::Onboarding);

#[tauri::command]
#[specta::specta]
pub async fn check_permissions(
    state: State<'_, AppState>,
) -> Result<Vec<PermissionReport>, AppError> {
    execute(&state, CHECK, (), |ctx, ()| async move {
        let provider = &ctx.ports().permissions;
        Ok([OsPermission::Microphone, OsPermission::Accessibility]
            .into_iter()
            .map(|permission| PermissionReport {
                permission,
                state: provider.check(permission),
            })
            .collect())
    })
    .await
}

#[derive(Debug, serde::Deserialize, specta::Type)]
pub struct PermissionInput {
    pub permission: OsPermission,
}

impl Validate for PermissionInput {
    fn validate(&self) -> Result<(), String> {
        Ok(())
    }
}

/**
 * WHAT:  Shows the system consent dialog.
 * WHY:   Only ever effective once — macOS shows its prompt a single time per
 *        bundle and signature, and after a denial this silently returns the
 *        same denied state. That is why the UI must follow a denial with the
 *        deep link rather than another attempt.
 * WHERE: Onboarding's permission step.
 */
const REQUEST: CommandSpec =
    CommandSpec::new("request_permission", CapabilityKey::Onboarding).exclusive();

#[tauri::command]
#[specta::specta]
pub async fn request_permission(
    state: State<'_, AppState>,
    input: PermissionInput,
) -> Result<PermissionState, AppError> {
    execute(&state, REQUEST, input, |ctx, input| async move {
        ctx.ports().permissions.request(input.permission)
    })
    .await
}

const OPEN_PANE: CommandSpec = CommandSpec::new("open_privacy_pane", CapabilityKey::Onboarding);

#[tauri::command]
#[specta::specta]
pub async fn open_privacy_pane(
    state: State<'_, AppState>,
    input: PermissionInput,
) -> Result<(), AppError> {
    execute(&state, OPEN_PANE, input, |ctx, input| async move {
        let pane = match input.permission {
            OsPermission::Microphone => crate::error::PrivacyPane::Microphone,
            OsPermission::Accessibility => crate::error::PrivacyPane::Accessibility,
        };
        ctx.ports().permissions.open_privacy_pane(pane)
    })
    .await
}

/// Resolves the options for the input-device setting. See ChoiceSource.
// Enumerating devices needs no grant — and onboarding lists them BEFORE asking
// for one, so preflighting this would make the setup screen unusable.
const DEVICES: CommandSpec =
    CommandSpec::new("list_input_devices", CapabilityKey::Dictation).reports();

#[tauri::command]
#[specta::specta]
pub async fn list_input_devices(
    state: State<'_, AppState>,
) -> Result<Vec<DeviceInfo>, AppError> {
    execute(&state, DEVICES, (), |ctx, ()| async move {
        ctx.ports().audio.list_devices()
    })
    .await
}

const OPEN_ONBOARDING: CommandSpec =
    CommandSpec::new("open_onboarding_window", CapabilityKey::Onboarding);

#[tauri::command]
#[specta::specta]
pub async fn open_onboarding_window(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    execute(&state, OPEN_ONBOARDING, (), |ctx, ()| async move {
        // Reset onboarding completion flag so setup flow is active
        let _ = crate::services::settings::set_setting(
            ctx.db(),
            crate::registry::keys::ONBOARDING_COMPLETE,
            &crate::types::SettingValue::Bool(false),
            crate::telemetry::now_ms(),
        );
        if let Some(window) = app.get_webview_window(crate::bootstrap::ONBOARDING_WINDOW) {
            #[cfg(target_os = "macos")]
            let _ = app.show();
            let _ = window.show();
            let _ = window.set_focus();
        }
        Ok(())
    })
    .await
}

/**
 * SOURCE OF TRUTH KEYWORDS: wipe_all_data
 * WHAT:  The "Delete all data" escape hatch. Drops every session, every
 *        dictionary entry, and resets all settings to their registry defaults
 *        in a single operation. The audit log is kept — it is the compliance
 *        proof that a wipe happened.
 * WHY:   `clear_history` removes only transcripts. A user who wants a clean
 *        slate should not have to navigate three separate controls to get one.
 *        One button, one confirmation, everything gone.
 *
 *        Settings are DELETED from the database rather than reset to a default
 *        value — a missing row already means "use the registry default", so
 *        deleting all rows is identical to a factory reset without any
 *        migration or schema knowledge needed here.
 * WHERE: Privacy section of Settings, behind a confirm step.
 */
const WIPE: CommandSpec = CommandSpec::new("wipe_all_data", CapabilityKey::Settings).exclusive();

#[derive(Debug, serde::Serialize, specta::Type)]
pub struct WipeResult {
    pub sessions_deleted: u32,
    pub dictionary_entries_deleted: u32,
    pub settings_deleted: u32,
}

#[tauri::command]
#[specta::specta]
pub async fn wipe_all_data(state: State<'_, AppState>) -> Result<WipeResult, AppError> {
    execute(&state, WIPE, (), |ctx, ()| async move {
        let sessions_deleted = services::sessions::delete_all_sessions(ctx.db())? as u32;
        let dictionary_entries_deleted = {
            let n: u64 = ctx.db().with_connection(|conn| {
                Ok(conn.execute("DELETE FROM dictionary", [])? as u64)
            })?;
            n as u32
        };
        let settings_deleted = services::settings::delete_all_settings(ctx.db())? as u32;

        // Keep the audit log — it is the proof the wipe happened.
        services::audit::append(
            ctx.db(),
            services::audit::AuditEntry {
                kind: services::audit::AuditKind::DataWiped,
                duration_ms: None,
                outcome: None,
                delivery: None,
            },
        );

        tracing::info!(
            sessions_deleted,
            dictionary_entries_deleted,
            settings_deleted,
            "data wipe completed"
        );

        Ok(WipeResult {
            sessions_deleted,
            dictionary_entries_deleted,
            settings_deleted,
        })
    })
    .await
}

