/*!
 * SOURCE OF TRUTH KEYWORDS: bootstrap_hotkeys, register_hotkeys, dictation_binding,
 *   bind_dictation, release_dictation_binding, watch_settings_for_rebinds,
 *   rebind_dictation_hotkey, on_dictation_hotkey, set_escape_registered, on_escape,
 *   code_from_name
 * WHAT:  Hotkey registration, rebinding watchers, escape management, and dispatch logic.
 * WHERE: Consumed by bootstrap/mod.rs and IPC adapters.
 */

use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::db::Database;
use crate::error::{AppError, AppResult, ErrorCode};
use crate::ipc::context::AppState;
use crate::registry::{self, keys};
use crate::services;
use crate::session::SessionEvent;
use crate::types::{HotkeyBinding, KeyModifier, RecordingMode, SettingValue};

static DICTATION_SHORTCUT: parking_lot::Mutex<Option<Shortcut>> = parking_lot::Mutex::new(None);
static MODIFIER_TAP: parking_lot::Mutex<Option<crate::adapters::os::ModifierTap>> =
    parking_lot::Mutex::new(None);
#[cfg(target_os = "windows")]
static MOUSE_RAW_INPUT: parking_lot::Mutex<Option<crate::adapters::os::MouseRawInputHandle>> =
    parking_lot::Mutex::new(None);
static CACHED_RECORDING_MODE: parking_lot::RwLock<Option<RecordingMode>> =
    parking_lot::RwLock::new(None);

pub fn release_dictation_binding(app: &AppHandle) {
    *MODIFIER_TAP.lock() = None;

    if let Some(previous) = DICTATION_SHORTCUT.lock().take() {
        let manager = app.global_shortcut();
        if manager.is_registered(previous) {
            if let Err(err) = manager.unregister(previous) {
                tracing::warn!(error = %err, "could not release the old hotkey");
            }
        }
    }
}

pub fn bind_dictation(app: &AppHandle, binding: &HotkeyBinding) -> AppResult<()> {
    if let Some(modifier) = binding.sole_modifier() {
        let handler_app = app.clone();
        let tap = crate::adapters::os::watch_modifier_tap(modifier, move || {
            on_dictation_hotkey(&handler_app, ShortcutState::Pressed);
        });

        return match tap {
            Some(tap) => {
                *MODIFIER_TAP.lock() = Some(tap);
                tracing::info!(
                    ?modifier,
                    taps = crate::adapters::os::TAPS_REQUIRED,
                    "dictation bound to a modifier tap"
                );
                Ok(())
            }
            None => Err(AppError::new(
                ErrorCode::HotkeyRegistrationFailed,
                "Murmur could not watch for that key. Check permissions and try again.",
            )
            .recoverable()),
        };
    }

    let shortcut = to_shortcut(binding)?;
    let handler_app = app.clone();
    app.global_shortcut()
        .on_shortcut(shortcut, move |_app, _shortcut, event| {
            on_dictation_hotkey(&handler_app, event.state());
        })
        .map_err(|err| {
            AppError::new(
                ErrorCode::HotkeyRegistrationFailed,
                "Murmur could not register its hotkey. Another app may already be using it.",
            )
            .recoverable()
            .with_detail(err)
        })?;

    *DICTATION_SHORTCUT.lock() = Some(shortcut);
    Ok(())
}

pub fn register_hotkeys(app: &AppHandle, db: &Database) -> AppResult<()> {
    let binding = dictation_binding(db);
    bind_dictation(app, &binding)?;
    if !binding.is_modifier_only() {
        tracing::info!(accelerator = binding.to_accelerator(), "hotkey registered");
    }
    #[cfg(target_os = "windows")]
    init_mouse_raw_input(app, db);
    Ok(())
}

pub fn watch_settings_for_rebinds(app: &AppHandle) {
    use crate::ipc::events::SettingsChanged;
    use tauri_specta::Event;

    apply_launch_at_login(app);

    let handler_app = app.clone();
    SettingsChanged::listen(app, move |event| {
        let key = event.payload.key.clone();
        let touched = |candidate: &str| key.as_deref().is_none_or(|k| k == candidate);

        if touched(keys::DICTATION_HOTKEY) {
            rebind_dictation_hotkey(&handler_app);
        }
        if touched(keys::DICTATION_MODE) {
            *CACHED_RECORDING_MODE.write() = None;
        }
        if touched(keys::LAUNCH_AT_LOGIN) {
            apply_launch_at_login(&handler_app);
        }
        #[cfg(target_os = "windows")]
        if touched(keys::MOUSE_TRIGGER) {
            if let Some(state) = handler_app.try_state::<AppState>() {
                let trigger = mouse_trigger_setting(&state.db);
                if let Some(handle) = MOUSE_RAW_INPUT.lock().as_ref() {
                    handle.set_trigger(trigger);
                    tracing::info!(?trigger, "mouse push-to-talk trigger updated");
                }
            }
        }
    });
}

pub fn rebind_dictation_hotkey(app: &AppHandle) {
    let Some(state) = app.try_state::<AppState>() else {
        return;
    };

    let binding = dictation_binding(&state.db);
    if let Err(err) = binding.bindable() {
        tracing::warn!(reason = %err, "ignoring an unbindable hotkey");
        return;
    }

    release_dictation_binding(app);

    match bind_dictation(app, &binding) {
        Ok(()) => tracing::info!(accelerator = binding.to_accelerator(), "hotkey rebound"),
        Err(err) => tracing::error!(error = %err, "could not register the new hotkey"),
    }
}

pub fn apply_launch_at_login(app: &AppHandle) {
    use tauri_plugin_autostart::ManagerExt;

    let Some(state) = app.try_state::<AppState>() else {
        return;
    };

    let wanted = matches!(
        services::settings::get_setting(&state.db, keys::LAUNCH_AT_LOGIN)
            .ok()
            .flatten()
            .or_else(|| {
                registry::setting_def(keys::LAUNCH_AT_LOGIN).map(|def| def.default.clone())
            }),
        Some(SettingValue::Bool(true))
    );

    let manager = app.autolaunch();
    let current = manager.is_enabled().unwrap_or(false);
    if current == wanted {
        return;
    }

    let outcome = if wanted {
        manager.enable()
    } else {
        manager.disable()
    };

    match outcome {
        Ok(()) => tracing::info!(enabled = wanted, "launch at login applied"),
        Err(err) => {
            tracing::error!(error = %err, enabled = wanted, "could not apply launch at login")
        }
    }
}

#[derive(Debug, Default, Clone)]
pub struct BindingState {
    pub held: bool,
    pub last_press: Option<std::time::Instant>,
}

static BINDING_STATES: std::sync::Mutex<Option<std::collections::HashMap<String, BindingState>>> =
    std::sync::Mutex::new(None);

pub fn with_binding_state<R>(binding_id: &str, f: impl FnOnce(&mut BindingState) -> R) -> R {
    let mut guard = BINDING_STATES.lock().unwrap_or_else(|e| e.into_inner());
    let map = guard.get_or_insert_with(std::collections::HashMap::new);
    let state = map.entry(binding_id.to_string()).or_default();
    f(state)
}

pub fn on_dictation_hotkey(app: &AppHandle, key_state: ShortcutState) {
    let span = tracing::span!(tracing::Level::INFO, "hotkey_to_recording", ?key_state);
    let _enter = span.enter();

    let Some(state) = app.try_state::<AppState>() else {
        return;
    };
    let state = state.inner().clone();

    if key_state == ShortcutState::Pressed {
        state.session.stamp_request();
    }

    #[cfg(target_os = "windows")]
    if key_state == ShortcutState::Pressed {
        unsafe {
            use windows::Win32::Foundation::{LPARAM, WPARAM};
            use windows::Win32::UI::WindowsAndMessaging::{
                GetForegroundWindow, PostMessageW, WM_CANCELMODE,
            };
            let hwnd = GetForegroundWindow();
            if !hwnd.0.is_null() {
                let _ = PostMessageW(hwnd, WM_CANCELMODE, WPARAM(0), LPARAM(0));
            }
        }
    }

    let mode = recording_mode(&state.db);
    let capturing = state.current_state().is_capturing();

    let (should_drop, is_double_tap) = with_binding_state("dictation", |bs| {
        if key_state == ShortcutState::Pressed {
            if bs.held {
                return (true, false);
            }
            bs.held = true;
            let is_double = bs
                .last_press
                .map(|prev| prev.elapsed() < std::time::Duration::from_millis(300))
                .unwrap_or(false);
            bs.last_press = Some(std::time::Instant::now());
            (false, is_double)
        } else {
            bs.held = false;
            (false, false)
        }
    });

    if should_drop {
        return;
    }

    if is_double_tap {
        tracing::info!("fast double-tap dictation triggered (<300ms)");
    }

    let event = match (mode, key_state) {
        (RecordingMode::PushToTalk, ShortcutState::Pressed) => {
            if !capturing {
                SessionEvent::StartRequested
            } else {
                return;
            }
        }
        (RecordingMode::PushToTalk, ShortcutState::Released) => {
            if capturing {
                SessionEvent::StopRequested
            } else {
                return;
            }
        }
        (RecordingMode::Toggle, ShortcutState::Pressed) => {
            if capturing {
                SessionEvent::StopRequested
            } else {
                SessionEvent::StartRequested
            }
        }
        (RecordingMode::Toggle, ShortcutState::Released) => {
            return;
        }
    };

    if !state.session.try_send(event.clone()) {
        let session = state.session.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(err) = session.send(event).await {
                tracing::warn!(error = %err, "hotkey event was not delivered");
            }
        });
    }
}

pub fn on_mouse_push_to_talk(app: &AppHandle, key_state: ShortcutState) {
    let span = tracing::span!(tracing::Level::INFO, "mouse_ptt_to_recording", ?key_state);
    let _enter = span.enter();

    let Some(state) = app.try_state::<AppState>() else {
        return;
    };
    let state = state.inner().clone();

    if key_state == ShortcutState::Pressed {
        state.session.stamp_request();

        #[cfg(target_os = "windows")]
        unsafe {
            use windows::Win32::Foundation::{LPARAM, WPARAM};
            use windows::Win32::UI::WindowsAndMessaging::{
                GetForegroundWindow, PostMessageW, WM_CANCELMODE,
            };
            let hwnd = GetForegroundWindow();
            if !hwnd.0.is_null() {
                let _ = PostMessageW(hwnd, WM_CANCELMODE, WPARAM(0), LPARAM(0));
            }
        }
    }

    let capturing = state.current_state().is_capturing();

    let should_drop = with_binding_state("mouse_ptt", |bs| {
        if key_state == ShortcutState::Pressed {
            if bs.held {
                return true;
            }
            bs.held = true;
            false
        } else {
            bs.held = false;
            false
        }
    });

    if should_drop {
        return;
    }

    let event = match key_state {
        ShortcutState::Pressed => {
            if !capturing {
                SessionEvent::StartRequested
            } else {
                return;
            }
        }
        ShortcutState::Released => {
            if capturing {
                SessionEvent::StopRequested
            } else {
                return;
            }
        }
    };

    if !state.session.try_send(event.clone()) {
        let session = state.session.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(err) = session.send(event).await {
                tracing::warn!(error = %err, "mouse push-to-talk event was not delivered");
            }
        });
    }
}

#[cfg(target_os = "windows")]
pub fn mouse_trigger_setting(db: &Database) -> crate::adapters::os::MouseTriggerButton {
    use crate::adapters::os::MouseTriggerButton;
    services::settings::get_setting(db, keys::MOUSE_TRIGGER)
        .ok()
        .flatten()
        .and_then(|val| match val {
            SettingValue::Choice(s) => Some(s),
            SettingValue::Text(s) => Some(s),
            _ => None,
        })
        .map(|s| MouseTriggerButton::from_str(&s))
        .unwrap_or(MouseTriggerButton::None)
}

#[cfg(target_os = "windows")]
pub fn init_mouse_raw_input(app: &AppHandle, db: &Database) {
    let initial_trigger = mouse_trigger_setting(db);
    let handler_app = app.clone();
    let handle = crate::adapters::os::start_mouse_raw_input(initial_trigger, move |state| {
        on_mouse_push_to_talk(&handler_app, state);
    });
    *MOUSE_RAW_INPUT.lock() = handle;
}

pub fn recording_mode(db: &Database) -> RecordingMode {
    if let Some(cached) = *CACHED_RECORDING_MODE.read() {
        return cached;
    }

    let stored = services::settings::get_setting(db, keys::DICTATION_MODE)
        .ok()
        .flatten();

    let mode = match stored {
        Some(SettingValue::Choice(value)) if value == "push_to_talk" => RecordingMode::PushToTalk,
        _ => RecordingMode::Toggle,
    };
    *CACHED_RECORDING_MODE.write() = Some(mode);
    mode
}

pub fn dictation_binding(db: &Database) -> HotkeyBinding {
    let stored = services::settings::get_setting(db, keys::DICTATION_HOTKEY)
        .ok()
        .flatten();

    if let Some(SettingValue::Hotkey(binding)) = stored {
        return binding;
    }

    registry::hotkey_defs()
        .first()
        .map(|def| def.default.clone())
        .unwrap_or(HotkeyBinding {
            modifiers: vec![KeyModifier::Option],
            key: "Space".to_string(),
        })
}

pub fn to_shortcut(binding: &HotkeyBinding) -> AppResult<Shortcut> {
    let mut modifiers = Modifiers::empty();
    for modifier in &binding.modifiers {
        modifiers |= match modifier {
            KeyModifier::Command => Modifiers::SUPER,
            KeyModifier::Control => Modifiers::CONTROL,
            KeyModifier::Option => Modifiers::ALT,
            KeyModifier::Shift => Modifiers::SHIFT,
        };
    }

    let code = code_from_name(&binding.key).ok_or_else(|| {
        AppError::new(
            ErrorCode::HotkeyRegistrationFailed,
            "That key cannot be used as a shortcut.",
        )
        .recoverable()
        .with_detail(format!("unmapped key `{}`", binding.key))
    })?;

    Ok(Shortcut::new(Some(modifiers), code))
}

pub fn code_from_name(name: &str) -> Option<Code> {
    use Code::*;
    Some(match name {
        "Space" => Space,
        "Enter" => Enter,
        "Tab" => Tab,
        "Backquote" => Backquote,
        "Backslash" => Backslash,
        "Semicolon" => Semicolon,
        "Quote" => Quote,
        "Comma" => Comma,
        "Period" => Period,
        "Slash" => Slash,
        "F1" => F1,
        "F2" => F2,
        "F3" => F3,
        "F4" => F4,
        "F5" => F5,
        "F6" => F6,
        "F7" => F7,
        "F8" => F8,
        "F9" => F9,
        "F10" => F10,
        "F11" => F11,
        "F12" => F12,
        "F13" => F13,
        "F14" => F14,
        "F15" => F15,
        "F16" => F16,
        "F17" => F17,
        "F18" => F18,
        "F19" => F19,
        "KeyA" => KeyA,
        "KeyB" => KeyB,
        "KeyC" => KeyC,
        "KeyD" => KeyD,
        "KeyE" => KeyE,
        "KeyF" => KeyF,
        "KeyG" => KeyG,
        "KeyH" => KeyH,
        "KeyI" => KeyI,
        "KeyJ" => KeyJ,
        "KeyK" => KeyK,
        "KeyL" => KeyL,
        "KeyM" => KeyM,
        "KeyN" => KeyN,
        "KeyO" => KeyO,
        "KeyP" => KeyP,
        "KeyQ" => KeyQ,
        "KeyR" => KeyR,
        "KeyS" => KeyS,
        "KeyT" => KeyT,
        "KeyU" => KeyU,
        "KeyV" => KeyV,
        "KeyW" => KeyW,
        "KeyX" => KeyX,
        "KeyY" => KeyY,
        "KeyZ" => KeyZ,
        "Digit0" => Digit0,
        "Digit1" => Digit1,
        "Digit2" => Digit2,
        "Digit3" => Digit3,
        "Digit4" => Digit4,
        "Digit5" => Digit5,
        "Digit6" => Digit6,
        "Digit7" => Digit7,
        "Digit8" => Digit8,
        "Digit9" => Digit9,
        _ => return None,
    })
}

pub fn set_escape_registered(app: &AppHandle, registered: bool) {
    let shortcut = Shortcut::new(None, Code::Escape);
    let manager = app.global_shortcut();

    if registered {
        if manager.is_registered(shortcut) {
            return;
        }
        let handler_app = app.clone();
        if let Err(err) = manager.on_shortcut(shortcut, move |_app, _shortcut, event| {
            if event.state() != ShortcutState::Pressed {
                return;
            }
            on_escape(&handler_app);
        }) {
            tracing::warn!(error = %err, "could not bind Escape for cancellation");
        }
        return;
    }

    if manager.is_registered(shortcut) {
        if let Err(err) = manager.unregister(shortcut) {
            tracing::warn!(error = %err, "could not release Escape");
        }
    }
}

pub fn on_escape(app: &AppHandle) {
    let Some(state) = app.try_state::<AppState>() else {
        return;
    };
    let state = state.inner().clone();

    tauri::async_runtime::spawn(async move {
        let event = match state.current_state() {
            crate::types::SessionState::CancelPending { .. } => SessionEvent::CancelAborted,
            _ => SessionEvent::CancelArmed,
        };
        let _ = state.session.send(event).await;
    });
}
