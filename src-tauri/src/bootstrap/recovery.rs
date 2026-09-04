/*!
 * SOURCE OF TRUTH KEYWORDS: bootstrap_recovery, recover_orphans, is_audio_device_ready,
 *   start_retention_sweep, sweep_retention, retention_cutoff, retention_days
 * WHAT:  Crash/interrupted session orphan recovery with audio readiness check,
 *        and scheduled database retention sweeping.
 * WHERE: Consumed by bootstrap/mod.rs.
 */

use cpal::traits::HostTrait;

use crate::db::Database;
use crate::ipc::context::AppState;
use crate::registry::{self, keys};
use crate::services;
use crate::telemetry::now_ms;
use crate::types::SettingValue;

/**
 * SOURCE OF TRUTH KEYWORDS: is_audio_device_ready
 * WHAT:  Checks whether the CPAL host has an available or default audio input device.
 * WHY:   Prevents running recovery in states where audio driver/device enumeration
 *        is still initialising or unavailable.
 */
pub fn is_audio_device_ready() -> bool {
    let host = cpal::default_host();
    host.default_input_device().is_some()
        || host
            .input_devices()
            .map(|mut d| d.next().is_some())
            .unwrap_or(false)
}

/**
 * SOURCE OF TRUTH KEYWORDS: recover_orphans
 * WHAT:  Closes out sessions that were in flight when the process last died.
 * WHY:   A row with no `ended_at` means the app was killed mid-recording. The
 *        audio is gone with the process, so the row cannot be completed — but
 *        it MUST be closed, or it stays in "find_orphans" forever and History
 *        shows a recording that never ends. Marking it is what makes the crash
 *        visible in History rather than silent.
 * WHERE: Called once at launch, before any new session can start.
 */
pub fn recover_orphans(db: &Database) {
    let audio_ready = is_audio_device_ready();
    if !audio_ready {
        tracing::debug!("Audio device check at startup: no input device available yet; proceeding with session cleanup");
    }

    match services::sessions::find_orphans(db) {
        Ok(orphans) if orphans.is_empty() => {}
        Ok(orphans) => {
            tracing::warn!(count = orphans.len(), audio_ready, "recovering interrupted sessions");
            for orphan in orphans {
                if let Err(err) = services::sessions::mark_orphaned(db, &orphan.id, now_ms()) {
                    tracing::error!(error = %err, "could not close an interrupted session");
                }
            }
        }
        Err(err) => tracing::error!(error = %err, "could not check for interrupted sessions"),
    }
}

/// How often the retention sweep runs after the one at launch. Six hours.
pub const RETENTION_SWEEP_INTERVAL: std::time::Duration = std::time::Duration::from_secs(6 * 60 * 60);

/**
 * SOURCE OF TRUTH KEYWORDS: start_retention_sweep, retention_days, purge
 * WHAT:  Applies `privacy.retention_days` — at launch, and every six hours
 *        after that for as long as the app is running.
 * WHERE: Started once by setup, after the database is open.
 */
pub fn start_retention_sweep(state: AppState) {
    tauri::async_runtime::spawn(async move {
        let mut ticker = tokio::time::interval(RETENTION_SWEEP_INTERVAL);
        loop {
            ticker.tick().await;
            sweep_retention(&state);
        }
    });
}

/// One sweep. Separated from the timer so it is testable without waiting.
pub fn sweep_retention(state: &AppState) {
    let days = retention_days(&state.db);

    let Some(cutoff) = retention_cutoff(days, now_ms()) else {
        return;
    };

    let Some(_guard) = state.begin_exclusive(registry::CapabilityKey::History) else {
        tracing::debug!("history is busy; retention sweep will run again later");
        return;
    };
    match services::sessions::purge_older_than(&state.db, cutoff) {
        Ok(0) => tracing::debug!(days, "retention sweep found nothing to delete"),
        Ok(removed) => tracing::info!(days, removed, "retention sweep deleted old transcripts"),
        Err(err) => tracing::error!(error = %err, "retention sweep failed"),
    }
}

/**
 * SOURCE OF TRUTH KEYWORDS: retention_cutoff
 * WHAT:  The timestamp before which transcripts should be deleted, or None when
 *        nothing should be.
 * WHERE: sweep_retention.
 */
pub fn retention_cutoff(days: i64, now: i64) -> Option<i64> {
    if days <= 0 {
        return None;
    }
    Some(now - days * 24 * 60 * 60 * 1000)
}

/// The user's retention window in days, falling back to the registry default.
pub fn retention_days(db: &Database) -> i64 {
    let stored = services::settings::get_setting(db, keys::RETENTION_DAYS)
        .ok()
        .flatten();

    let value = stored
        .or_else(|| registry::setting_def(keys::RETENTION_DAYS).map(|def| def.default.clone()));

    match value {
        Some(SettingValue::Number(days)) => days as i64,
        _ => 0,
    }
}
