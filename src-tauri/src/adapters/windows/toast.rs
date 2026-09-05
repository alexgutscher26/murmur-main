/*!
 * SOURCE OF TRUTH KEYWORDS: WindowsToast, show_toast, toast_delivery, toast_error
 * WHAT:  Displays native Windows 11 toast notification cards via Windows.UI.Notifications.
 * WHY:   Gives users persistent and interactive visual feedback for completed transcriptions,
 *        long-running dictation results, and fallback/error notices (e.g. UAC admin windows).
 * WHERE: adapters/windows/toast.rs; called on session delivery and error transitions.
 */

use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

pub struct WindowsToast;

impl WindowsToast {
    /**
     * SOURCE OF TRUTH KEYWORDS: notify_delivery
     * WHAT:  Shows a rich notification card when a dictation is delivered or copied.
     */
    pub fn notify_delivery(app: &AppHandle, text: &str, is_clipboard_only: bool) {
        let title = if is_clipboard_only {
            "Murmur — Text Copied to Clipboard"
        } else {
            "Murmur — Text Delivered"
        };

        let snippet: String = if text.chars().count() > 120 {
            format!("{}...", text.chars().take(117).collect::<String>())
        } else {
            text.to_string()
        };

        if let Err(err) = app
            .notification()
            .builder()
            .title(title)
            .body(&snippet)
            .show()
        {
            tracing::debug!(error = %err, "could not post Windows notification toast");
        }
    }

    /**
     * SOURCE OF TRUTH KEYWORDS: notify_error
     * WHAT:  Shows an error toast card when dictation fails or encounters a permission block.
     */
    pub fn notify_error(app: &AppHandle, summary: &str, detail: &str) {
        if let Err(err) = app
            .notification()
            .builder()
            .title(format!("Murmur — {summary}"))
            .body(detail)
            .show()
        {
            tracing::debug!(error = %err, "could not post Windows error toast");
        }
    }

    /**
     * SOURCE OF TRUTH KEYWORDS: is_dnd_active
     * WHAT:  Checks whether Windows Focus Assist / Do Not Disturb / Quiet Hours is active.
     * WHY:   Re-engagement prompts must respect the user's quiet hours and fullscreen apps.
     * WHERE: Called by bootstrap/reengagement.rs before dispatching re-engagement toasts.
     */
    #[cfg(target_os = "windows")]
    pub fn is_dnd_active() -> bool {
        use windows::Win32::System::LibraryLoader::{GetModuleHandleA, GetProcAddress};

        unsafe {
            let shell32 = GetModuleHandleA(windows::core::s!("shell32.dll")).unwrap_or_default();
            if shell32.0.is_null() {
                return false;
            }
            let func = GetProcAddress(shell32, windows::core::s!("SHQueryUserNotificationState"));
            if let Some(func) = func {
                type FnSHQueryUserNotificationState = unsafe extern "system" fn(*mut i32) -> i32;
                let query_fn: FnSHQueryUserNotificationState = std::mem::transmute(func);
                let mut state: i32 = 0;
                if query_fn(&mut state) == 0 {
                    // 1 = QUNS_BUSY, 2 = QUNS_RUNNING_D3D_FULL_SCREEN, 3 = QUNS_PRESENTATION_MODE, 5 = QUNS_QUIET_TIME
                    return state == 1 || state == 2 || state == 3 || state == 5;
                }
            }
            false
        }
    }

    #[cfg(not(target_os = "windows"))]
    pub fn is_dnd_active() -> bool {
        false
    }

    /**
     * SOURCE OF TRUTH KEYWORDS: notify_reengagement
     * WHAT:  Shows a gentle re-engagement toast after prolonged inactivity (3+ days).
     * WHY:   Provides a soft reminder with a clear shortcut prompt, respecting Do Not Disturb.
     */
    pub fn notify_reengagement(app: &AppHandle, hotkey_desc: &str) {
        let body = format!(
            "It's been a few days since your last dictation. Press {hotkey_desc} anytime to capture your thoughts."
        );
        if let Err(err) = app
            .notification()
            .builder()
            .title("Murmur is ready whenever you are")
            .body(&body)
            .show()
        {
            tracing::debug!(error = %err, "could not post re-engagement toast");
        }
    }
}
