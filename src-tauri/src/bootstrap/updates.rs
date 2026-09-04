/*!
 * SOURCE OF TRUTH KEYWORDS: bootstrap_updates, start_update_checks, watch_permissions, report_permissions
 * WHAT:  Background update checker and live OS permissions observer.
 * WHERE: Consumed by bootstrap/mod.rs.
 */

use std::sync::Arc;
use tauri::{AppHandle, Manager};

use crate::ipc::context::{AppState, Ports};
use crate::ports::permissions::OsPermission;
use crate::registry;

pub const UPDATE_CHECK_INTERVAL: std::time::Duration = std::time::Duration::from_secs(24 * 60 * 60);

/**
 * SOURCE OF TRUTH KEYWORDS: report_permissions, startup_permission_state
 * WHAT:  Logs the state of every OS grant once at launch.
 * WHERE: Called once from setup, after the ports exist.
 */
pub fn report_permissions(ports: &Ports) {
    for permission in [OsPermission::Microphone, OsPermission::Accessibility] {
        let state = ports.permissions.check(permission);
        tracing::info!(?permission, ?state, "permission at startup");
    }
}

/**
 * SOURCE OF TRUTH KEYWORDS: start_update_checks, lying_control
 * WHAT:  Checks for a new version at launch and once a day, and tells the UI
 *        when one exists.
 * WHERE: Started once by setup.
 */
pub fn start_update_checks(state: AppState) {
    use crate::ipc::commands::updates::{look_for_update, UpdateCheck};
    use crate::ipc::events::UpdateAvailable;
    use tauri_specta::Event;

    if std::env::var("TAURI_UPDATER_DISABLE")
        .map(|v| v == "1" || v.eq_ignore_ascii_case("true"))
        .unwrap_or(false)
    {
        tracing::debug!("TAURI_UPDATER_DISABLE is set; skipping automatic update checks");
        return;
    }

    tauri::async_runtime::spawn(async move {
        let mut ticker = tokio::time::interval(UPDATE_CHECK_INTERVAL);
        loop {
            // The first tick completes immediately: that is the launch check.
            ticker.tick().await;

            let Some(_guard) = state.begin_exclusive(registry::CapabilityKey::Updates) else {
                tracing::debug!("an update check is already running; skipping this one");
                continue;
            };

            match look_for_update(&state).await {
                Ok(UpdateCheck::Available {
                    version,
                    current_version,
                    notes,
                    ..
                }) => {
                    tracing::info!(version, current_version, "an update is available");
                    let event = UpdateAvailable {
                        version,
                        current_version,
                        notes,
                    };
                    if let Err(err) = event.emit(&state.app) {
                        tracing::warn!(error = %err, "could not announce the update");
                    }
                }
                Ok(UpdateCheck::UpToDate { current_version }) => {
                    tracing::debug!(current_version, "already on the newest version")
                }
                Ok(UpdateCheck::Disabled) => {
                    tracing::debug!("update checks are turned off")
                }
                Err(err) => tracing::info!(error = %err, "could not check for updates"),
            }
        }
    });
}

/**
 * SOURCE OF TRUTH KEYWORDS: watch_permissions, permissions_without_restart
 * WHAT:  Watches the OS grants and pushes them to the windows when one changes.
 * WHERE: Started once by setup.
 */
pub fn watch_permissions(app: &AppHandle) {
    use crate::ipc::commands::system::PermissionReport;
    use crate::ipc::events::PermissionsChanged;
    use std::time::Duration;
    use tauri_specta::Event as _;

    const EAGER: Duration = Duration::from_millis(750);
    const RELAXED: Duration = Duration::from_secs(10);

    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let mut last: Option<Vec<PermissionReport>> = None;

        loop {
            let Some(state) = app.try_state::<AppState>() else {
                return;
            };
            let permissions = Arc::clone(&state.ports.permissions);

            let reports: Vec<PermissionReport> =
                [OsPermission::Microphone, OsPermission::Accessibility]
                    .into_iter()
                    .map(|permission| PermissionReport {
                        permission,
                        state: permissions.check(permission),
                    })
                    .collect();

            let all_granted = reports.iter().all(|report| report.state.is_granted());

            if last.as_deref() != Some(reports.as_slice()) {
                if last.is_some() {
                    tracing::info!(?reports, "an OS permission changed");
                }
                let _ = (PermissionsChanged {
                    reports: reports.clone(),
                })
                .emit(&app);
                last = Some(reports);
            }

            tokio::time::sleep(if all_granted { RELAXED } else { EAGER }).await;
        }
    });
}
