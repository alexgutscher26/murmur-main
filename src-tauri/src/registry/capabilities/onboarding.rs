/*!
 * SOURCE OF TRUTH KEYWORDS: onboarding_capability, CapabilityKey::Onboarding
 * WHAT:  Declares first-run Setup / Onboarding capability.
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::{text, toggle};
use crate::registry::capability::{Capability, CapabilityKey, SettingSection};
use crate::registry::keys;

pub fn onboarding_capability() -> Capability {
    Capability {
        key: CapabilityKey::Onboarding,
        name: text("Setup"),
        description: text("First-run permissions, model download, and a hotkey test."),
        requires: vec![],
        engine_needs: vec![],
        nav: None,
        hotkey: None,
        metrics: vec![],
        settings: vec![toggle(
            keys::ONBOARDING_COMPLETE,
            "Setup complete",
            "Whether first-run setup has been finished.",
            SettingSection::General,
            false,
        )],
    }
}
