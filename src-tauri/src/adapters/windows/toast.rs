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
}
