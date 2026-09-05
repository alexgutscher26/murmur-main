/*!
 * SOURCE OF TRUTH KEYWORDS: reengagement, evaluate_and_prompt, start_reengagement_checks,
 *   IDLE_THRESHOLD_MS, PROMPT_THROTTLE_MS
 * WHAT:  Periodically checks for 3+ days of dictation inactivity and displays a gentle
 *        Windows toast notification with shortcut prompt, respecting Focus Assist / DND.
 * WHY:   A quiet re-activation nudge brings inactive users back into the habit loop.
 *        Throttled to at most once per 7-day window and strictly suppressed when the system
 *        is in Focus Assist, Fullscreen, or Do Not Disturb.
 * WHERE: Started by bootstrap/mod.rs at launch; evaluated periodically in the background.
 */

use std::time::Duration;
use tauri::AppHandle;

use crate::adapters::windows::WindowsToast;
use crate::db::Database;
use crate::error::AppResult;
use crate::ipc::context::AppState;
use crate::registry::keys;
use crate::services;
use crate::types::{HotkeyBinding, KeyModifier, SettingValue};

pub const IDLE_THRESHOLD_MS: i64 = 3 * 24 * 60 * 60 * 1000; // 3 days
pub const PROMPT_THROTTLE_MS: i64 = 7 * 24 * 60 * 60 * 1000; // 7 days
pub const CHECK_INTERVAL: Duration = Duration::from_secs(4 * 60 * 60); // 4 hours

/**
 * SOURCE OF TRUTH KEYWORDS: evaluate_and_prompt
 * WHAT:  Assesses if the user is eligible for a re-engagement prompt and displays the toast.
 * RETURNS: Ok(true) if a prompt was shown, Ok(false) if skipped or throttled.
 */
pub async fn evaluate_and_prompt(app: &AppHandle, db: &Database) -> AppResult<bool> {
    // 1. Respect system Do Not Disturb / Focus Assist / Presentation mode
    if WindowsToast::is_dnd_active() {
        tracing::debug!("skipping re-engagement check: Focus Assist / Do Not Disturb is active");
        return Ok(false);
    }

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as i64;

    // 2. Check last session timestamp
    let latest_session_ms = services::stats::latest_session_timestamp(db)?;
    let Some(latest) = latest_session_ms else {
        // No delivered sessions ever recorded; user is still onboarding or hasn't started
        return Ok(false);
    };

    if now - latest < IDLE_THRESHOLD_MS {
        // Active within the last 3 days
        return Ok(false);
    }

    // 3. Check anti-spam throttle (max once per 7-day window)
    let last_prompt = services::settings::get_setting(db, keys::LAST_REENGAGEMENT_PROMPT_MS)?;
    if let Some(SettingValue::Number(last_prompt_ms)) = last_prompt {
        if now - (last_prompt_ms as i64) < PROMPT_THROTTLE_MS {
            return Ok(false);
        }
    }

    // 4. Resolve active hotkey representation
    let hotkey_val = services::settings::get_setting(db, keys::DICTATION_HOTKEY)?;
    let hotkey_desc = match hotkey_val {
        Some(SettingValue::Hotkey(hk)) => format_hotkey(&hk),
        _ => "Ctrl+Space".to_string(),
    };

    // 5. Display the native Windows toast
    WindowsToast::notify_reengagement(app, &hotkey_desc);

    // 6. Record prompt timestamp to enforce the 7-day throttle
    services::settings::set_setting(
        db,
        keys::LAST_REENGAGEMENT_PROMPT_MS,
        &SettingValue::Number(now as f64),
        now,
    )?;

    tracing::info!(idle_days = (now - latest) / (24 * 60 * 60 * 1000), "dispatched re-engagement prompt toast");
    Ok(true)
}

fn format_hotkey(hk: &HotkeyBinding) -> String {
    let mut parts = Vec::new();
    for modifier in &hk.modifiers {
        match modifier {
            KeyModifier::Command | KeyModifier::Control => parts.push("Ctrl"),
            KeyModifier::Option => parts.push("Alt"),
            KeyModifier::Shift => parts.push("Shift"),
        }
    }
    parts.push(&hk.key);
    parts.join("+")
}

/**
 * SOURCE OF TRUTH KEYWORDS: start_reengagement_checks
 * WHAT:  Starts the periodic re-engagement scheduler.
 * WHERE: Called by bootstrap/mod.rs on app startup.
 */
pub fn start_reengagement_checks(state: AppState) {
    tauri::async_runtime::spawn(async move {
        // Initial grace period of 60 seconds after launch before first check
        tokio::time::sleep(Duration::from_secs(60)).await;

        let mut ticker = tokio::time::interval(CHECK_INTERVAL);
        loop {
            ticker.tick().await;
            if let Err(err) = evaluate_and_prompt(&state.app, &state.db).await {
                tracing::debug!(error = %err, "error during re-engagement evaluation");
            }
        }
    });
}
