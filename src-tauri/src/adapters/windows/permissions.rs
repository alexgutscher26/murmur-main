/*!
 * SOURCE OF TRUTH KEYWORDS: WindowsPermissions, check, request, open_privacy_pane,
 *   PermissionProvider, OsPermission, PermissionState
 * WHAT:  Implements the PermissionProvider port for Windows.
 * WHY:   Windows desktop apps do not require explicit macOS-style TCC accessibility
 *        prompts to simulate keystrokes, and microphone access is governed by
 *        Windows Privacy Settings with direct deep-links.
 * WHERE: Implements ports/permissions.rs; consumed by ipc/factory.rs and onboarding.
 */

use crate::error::{AppError, AppResult, PrivacyPane};
use crate::ports::permissions::{OsPermission, PermissionProvider, PermissionState};

pub struct WindowsPermissions;

impl WindowsPermissions {
    pub fn new() -> Self {
        Self
    }
}

impl Default for WindowsPermissions {
    fn default() -> Self {
        Self::new()
    }
}

impl PermissionProvider for WindowsPermissions {
    fn check(&self, permission: OsPermission) -> PermissionState {
        match permission {
            OsPermission::Microphone => PermissionState::Granted,
            OsPermission::Accessibility => PermissionState::Granted,
        }
    }

    fn request(&self, permission: OsPermission) -> AppResult<PermissionState> {
        Ok(self.check(permission))
    }

    fn open_privacy_pane(&self, pane: PrivacyPane) -> AppResult<()> {
        let uri = match pane {
            PrivacyPane::Microphone => "ms-settings:privacy-microphone",
            PrivacyPane::Accessibility => "ms-settings:easeofaccess-keyboard",
        };

        std::process::Command::new("explorer")
            .arg(uri)
            .spawn()
            .map_err(|err| {
                AppError::internal(format!("could not open settings URI {uri}: {err}"))
            })?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn permissions_default_to_granted_on_windows() {
        let provider = WindowsPermissions::new();
        assert_eq!(provider.check(OsPermission::Microphone), PermissionState::Granted);
        assert_eq!(provider.check(OsPermission::Accessibility), PermissionState::Granted);
    }
}
