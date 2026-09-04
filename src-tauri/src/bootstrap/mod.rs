/*!
 * SOURCE OF TRUTH KEYWORDS: bootstrap, setup, build_ports, spawn_actor,
 *   register_hotkeys, prepare_engine, recover_orphans, show_first_run
 * WHAT:  Everything that has to happen once at launch: resolve paths, open the
 *        database, construct the adapters, start the session actor, register
 *        the global hotkey, and warm the model.
 * WHY:   This is the ONLY module that names concrete adapters. Everything else
 *        in the app is written against ports, so swapping an engine or moving
 *        to Windows changes this module and one directory under adapters/, and
 *        nothing else.
 * WHERE: Called from lib.rs `run`.
 */

pub mod engine;
pub mod hotkeys;
pub mod recovery;
pub mod updates;
pub mod windows;

use std::sync::Arc;

use tauri::{AppHandle, Manager};

use crate::adapters;
use crate::adapters::cpal::CpalAudioSource;
use crate::adapters::os::{OsInjector, OsPermissions};
use crate::adapters::rules::RuleEnhancer;
use crate::config::AppPaths;
use crate::db::Database;
use crate::error::{AppError, AppResult};
use crate::ipc::context::{AppState, Ports, SessionHandle};
use crate::pipeline::worker::AsrWorker;
use crate::registry;
use crate::session::{SessionActor, SessionSettings};

pub use hotkeys::{code_from_name, set_escape_registered};
pub use windows::{attach_rail, place_rail, DASHBOARD_WINDOW, ONBOARDING_WINDOW, PILL_WINDOW, SIDEBAR_WINDOW};

/**
 * SOURCE OF TRUTH KEYWORDS: setup
 * WHAT:  The whole launch sequence.
 * WHERE: Called from the Tauri builder's setup hook.
 */
pub fn setup(app: &AppHandle) -> AppResult<()> {
    let resource_models = app
        .path()
        .resource_dir()
        .map(|dir| dir.join("resources").join("models"))
        .ok();
    let resource_models_alt = app
        .path()
        .resource_dir()
        .map(|dir| dir.join("models"))
        .ok();
    let app_data_models = app
        .path()
        .app_data_dir()
        .map(|dir| dir.join("models"))
        .ok();

    let bundled_dir = [resource_models, resource_models_alt, app_data_models]
        .into_iter()
        .flatten()
        .find(|p| p.is_dir() && std::fs::read_dir(p).map(|mut entries| entries.next().is_some()).unwrap_or(false))
        .or_else(|| {
            app.path()
                .resource_dir()
                .map(|dir| dir.join("resources").join("models"))
                .ok()
        })
        .unwrap_or_default();

    let paths = AppPaths::resolve()?.with_bundled_models(bundled_dir);
    let db = Database::open(&paths.db_path)?;

    // A registry that contradicts itself is a wiring bug, and it is far better
    // to know at launch than to find a control that will not render.
    if let Err(problems) = registry::validate_registry() {
        return Err(AppError::internal(problems.join("; ")));
    }

    // BEFORE the state is managed and before the actor exists, and the ordering
    // is the whole point. `manage` makes every IPC command reachable and the
    // three windows are created by tauri.conf before setup runs, so a webview
    // that invokes start_recording during the rest of this function gets a
    // session row written — and a sweep that ran afterwards would mark that
    // LIVE session orphaned for having no ended_at. Recovering crashed sessions
    // is only meaningful while no session can yet exist.
    recovery::recover_orphans(&db);

    let ports = build_ports(app, &paths)?;
    let settings = SessionSettings::load(&db);

    let (event_tx, event_rx) = tokio::sync::mpsc::channel(crate::session::actor::EVENT_QUEUE_DEPTH);
    let state = AppState::new(
        paths.clone(),
        db.clone(),
        ports.clone(),
        SessionHandle::new(event_tx),
        app.clone(),
    );
    app.manage(state.clone());

    let (decode_tx, decode_rx) = tokio::sync::mpsc::channel(16);
    let worker = AsrWorker::spawn(Arc::clone(&ports.engine), decode_tx)
        .map_err(|err| AppError::internal(err).with_detail("spawning the ASR worker"))?;

    let actor = SessionActor::new(state.session_context(), worker, decode_rx, settings.clone());
    tauri::async_runtime::spawn(actor.run(event_rx));

    windows::apply_window_vibrancy(app);
    windows::let_the_pill_float_over_everything(app);
    crate::tray::adopt_pill_tokens(app);
    updates::watch_permissions(app);
    windows::attach_sidebar(app);
    windows::keep_rail_centred(app);
    windows::keep_windows_alive(app);
    windows::track_pill_drag(app);
    updates::report_permissions(&ports);
    recovery::start_retention_sweep(state.clone());
    if std::env::var("TAURI_UPDATER_DISABLE")
        .map(|v| v == "1" || v.eq_ignore_ascii_case("true"))
        .unwrap_or(false)
        || (cfg!(debug_assertions) && std::env::var("TAURI_UPDATER_FORCE").is_err())
    {
        tracing::debug!("updater checks disabled in development / debug mode (TAURI_UPDATER_DISABLE)");
    } else {
        updates::start_update_checks(state.clone());
    }

    if let Err(err) = hotkeys::register_hotkeys(app, &db) {
        tracing::error!(error = %err, "could not register the dictation hotkey; the app will start without it");
    }
    hotkeys::watch_settings_for_rebinds(app);
    engine::prepare_engine(
        app,
        Arc::clone(&ports.engine),
        Arc::clone(&ports.models),
        engine::default_model_id(),
    );
    windows::show_first_window(app, &db)?;
    windows::show_dashboard_on_launch(app);

    Ok(())
}

/**
 * SOURCE OF TRUTH KEYWORDS: build_ports
 * WHAT:  Constructs one implementation per port.
 * WHERE: Called once by setup.
 */
fn build_ports(app: &AppHandle, paths: &AppPaths) -> AppResult<Ports> {
    let events: Arc<dyn crate::ports::EventSink> =
        Arc::new(adapters::TauriEventSink::new(app.clone()));

    let models = adapters::build_model_store(paths.clone(), Arc::clone(&events))?;

    let model_id = engine::default_model_id();
    let engine = adapters::build_engine(
        &adapters::default_engine_id(),
        paths.model_file(model_id.as_str()),
    )?;

    Ok(Ports {
        engine,
        audio: Arc::new(CpalAudioSource::new()),
        enhancer: Arc::new(RuleEnhancer::new()),
        injector: Arc::new(OsInjector::new(OsPermissions::new())),
        models,
        permissions: Arc::new(OsPermissions::new()),
        events,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::error::ErrorCode;
    use crate::registry::keys;
    use crate::services;
    use crate::types::{HotkeyBinding, KeyModifier, SettingValue};

    #[test]
    fn the_startup_warm_up_never_acts_on_a_missing_model() {
        use crate::types::ModelState;

        assert!(
            !engine::worth_warming(&ModelState::NotDownloaded),
            "the warm-up would download a model the user has not chosen yet"
        );

        for state in [
            ModelState::Ready,
            ModelState::Verifying,
            ModelState::Optimizing,
            ModelState::Failed {
                message: "a stale verdict on a file that may since have changed".into(),
            },
        ] {
            assert!(
                engine::worth_warming(&state),
                "{state:?} has a file on disk and should be verified at startup"
            );
        }
    }

    #[test]
    fn constructors_do_not_need_an_async_runtime() {
        use crate::adapters::cpal::CpalAudioSource;
        #[cfg(target_os = "macos")]
        use crate::adapters::macos::{MacosInjector, MacosPermissions};
        use crate::adapters::rules::RuleEnhancer;
        #[cfg(target_os = "windows")]
        use crate::adapters::windows::{WindowsInjector, WindowsPermissions};
        use crate::pipeline::Chunker;
        use crate::session::SessionSettings;

        let _audio = CpalAudioSource::new();
        let _enhancer = RuleEnhancer::new();
        #[cfg(target_os = "macos")]
        {
            let _permissions = MacosPermissions::new();
            let _injector = MacosInjector::new(MacosPermissions::new());
        }
        #[cfg(target_os = "windows")]
        {
            let _permissions = WindowsPermissions::new();
            let _injector = WindowsInjector::new(WindowsPermissions::new());
        }

        let _chunker = Chunker::new();
        let _settings = SessionSettings::defaults();
        let _machine = crate::session::SessionMachine::new(3_000);
        let _latency = crate::telemetry::LatencyRecorder::new();

        let db = Database::open_in_memory().expect("in-memory database");
        let _from_db = SessionSettings::load(&db);
    }

    #[test]
    fn the_stop_chime_is_not_in_the_delivery_worker() {
        let delivery = include_str!("../session/delivery.rs");
        let code: String = delivery
            .lines()
            .filter(|line| {
                let t = line.trim_start();
                !t.starts_with("//") && !t.starts_with('*') && !t.starts_with("/*")
            })
            .collect::<Vec<_>>()
            .join("\n");

        assert!(
            !code.contains("play_feedback"),
            "the delivery worker plays a sound again; the stop chime belongs on \
             the transition out of capture, in the actor"
        );
    }

    #[test]
    fn orphan_recovery_runs_before_anything_can_start_a_session() {
        let source = include_str!("mod.rs");
        let setup = source
            .split_once("pub fn setup(app: &AppHandle)")
            .expect("setup exists")
            .1;

        let recover = setup
            .find("recovery::recover_orphans(&db)")
            .expect("setup recovers orphans");
        let manage = setup.find("app.manage(state").expect("setup manages state");
        let spawn = setup
            .find("spawn(actor.run(")
            .expect("setup spawns the actor");

        assert!(
            recover < manage,
            "recover_orphans runs after app.manage, so it can mark a live session orphaned"
        );
        assert!(
            recover < spawn,
            "recover_orphans runs after the actor is spawned, so it can race a real session"
        );
    }

    #[test]
    fn the_single_instance_plugin_is_registered_before_any_other() {
        let source = include_str!("../lib.rs");
        let chain = source
            .split_once("tauri::Builder::default()")
            .expect("the builder chain exists")
            .1;

        let single = chain
            .find("tauri_plugin_single_instance::init")
            .expect("the single-instance plugin must be registered");

        for (offset, _) in chain.match_indices(".plugin(") {
            let named = &chain[offset..];
            if named.starts_with(".plugin(tauri_plugin_single_instance") {
                continue;
            }
            assert!(
                offset > single,
                "a plugin is registered before single-instance; a second launch would run \
                 part of setup against the first process's database before being refused"
            );
        }
    }

    #[test]
    fn a_retention_window_of_zero_deletes_nothing() {
        assert_eq!(recovery::retention_cutoff(0, 1_000_000), None);
        assert_eq!(recovery::retention_cutoff(-7, 1_000_000), None);
    }

    #[test]
    fn a_retention_window_cuts_off_exactly_that_many_days_back() {
        let day = 24 * 60 * 60 * 1000;
        assert_eq!(recovery::retention_cutoff(1, 10 * day), Some(9 * day));
        assert_eq!(recovery::retention_cutoff(30, 100 * day), Some(70 * day));
    }

    #[test]
    fn the_retention_window_falls_back_to_the_registry() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let declared = match registry::setting_def(keys::RETENTION_DAYS).map(|d| d.default.clone())
        {
            Some(SettingValue::Number(days)) => days as i64,
            other => panic!("retention_days must be declared as a Number, got {other:?}"),
        };
        assert_eq!(recovery::retention_days(&db), declared);

        services::settings::set_setting(&db, keys::RETENTION_DAYS, &SettingValue::Number(14.0), 1)?;
        assert_eq!(recovery::retention_days(&db), 14);
        Ok(())
    }

    #[test]
    fn a_written_hotkey_is_what_the_rebind_would_register() -> AppResult<()> {
        let db = Database::open_in_memory()?;
        let before = hotkeys::dictation_binding(&db);

        let rebound = HotkeyBinding {
            modifiers: vec![KeyModifier::Control, KeyModifier::Shift],
            key: "KeyD".to_string(),
        };
        assert_ne!(before.to_accelerator(), rebound.to_accelerator());

        services::settings::set_setting(
            &db,
            keys::DICTATION_HOTKEY,
            &SettingValue::Hotkey(rebound.clone()),
            1,
        )?;

        let after = hotkeys::dictation_binding(&db);
        assert_eq!(after.to_accelerator(), rebound.to_accelerator());
        assert!(
            hotkeys::to_shortcut(&after).is_ok(),
            "a rebind must produce something registrable"
        );
        Ok(())
    }

    #[test]
    fn the_default_binding_is_the_one_the_registry_declares() {
        let def = registry::hotkey_defs();
        let first = def.first().expect("dictation declares a hotkey");
        assert_eq!(first.default.key, "Space");
        assert!(first.default.modifiers.contains(&KeyModifier::Option));
    }

    #[test]
    fn the_default_binding_converts_to_a_registrable_shortcut() {
        let binding = registry::hotkey_defs()[0].default.clone();
        assert!(hotkeys::to_shortcut(&binding).is_ok());
    }

    #[test]
    fn an_unmappable_key_is_refused_rather_than_silently_ignored() {
        let binding = HotkeyBinding {
            modifiers: vec![KeyModifier::Option],
            key: "NotAKey".into(),
        };
        let err = hotkeys::to_shortcut(&binding).expect_err("must refuse");
        assert_eq!(err.code, ErrorCode::HotkeyRegistrationFailed);
        assert!(err.recoverable, "the user can pick another key");
    }

    #[test]
    fn every_modifier_maps_onto_a_real_one() {
        let binding = HotkeyBinding {
            modifiers: vec![
                KeyModifier::Command,
                KeyModifier::Control,
                KeyModifier::Option,
                KeyModifier::Shift,
            ],
            key: "KeyD".into(),
        };
        assert!(hotkeys::to_shortcut(&binding).is_ok());
    }

    #[test]
    fn every_window_is_granted_a_capability() {
        let conf: serde_json::Value = serde_json::from_str(include_str!("../../tauri.conf.json"))
            .expect("tauri.conf.json parses");
        let capability: serde_json::Value =
            serde_json::from_str(include_str!("../../capabilities/default.json"))
                .expect("capabilities/default.json parses");

        let granted: Vec<&str> = capability["windows"]
            .as_array()
            .expect("a capability must list its windows")
            .iter()
            .filter_map(|w| w.as_str())
            .collect();
        assert!(!granted.is_empty(), "no windows are granted anything");

        let declared = conf["app"]["windows"]
            .as_array()
            .expect("tauri.conf.json declares windows");
        assert!(
            !declared.is_empty(),
            "no windows declared — the check would be vacuous"
        );

        for window in declared {
            let label = window["label"].as_str().expect("every window has a label");
            assert!(
                granted.contains(&label),
                "window `{label}` is declared but appears in no capability. It will render \
                 and load data normally, and every core or plugin call it makes — including \
                 any cross-window event — will be refused silently."
            );
        }
    }

    #[test]
    fn the_bundle_declares_the_microphone_entitlement() {
        let entitlements = include_str!("../../entitlements.plist");
        assert!(
            entitlements.contains("com.apple.security.device.audio-input"),
            "entitlements.plist must declare audio-input or the app records silence"
        );

        let config = include_str!("../../tauri.conf.json");
        assert!(
            config.contains("\"entitlements\": \"entitlements.plist\""),
            "tauri.conf.json must reference entitlements.plist or it is never applied"
        );
    }

    #[test]
    fn window_labels_match_the_configuration() {
        let config = include_str!("../../tauri.conf.json");
        for label in [DASHBOARD_WINDOW, PILL_WINDOW, ONBOARDING_WINDOW] {
            assert!(
                config.contains(&format!("\"label\": \"{label}\"")),
                "window `{label}` is not declared in tauri.conf.json"
            );
        }
    }
}
