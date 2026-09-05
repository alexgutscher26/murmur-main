/*!
 * SOURCE OF TRUTH KEYWORDS: onboarding_capability, CapabilityKey::Onboarding
 * WHAT:  Declares first-run Setup / Onboarding capability.
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::{number, text, toggle};
use crate::registry::capability::{Capability, CapabilityKey, SettingSection};
use crate::registry::keys;

pub fn onboarding_capability() -> Capability {
    Capability {
        key: CapabilityKey::Onboarding,
        name: text("Setup"),
        description: text("First-run permissions, model download, and an interactive tutorial."),
        requires: vec![],
        engine_needs: vec![],
        nav: None,
        hotkey: None,
        metrics: vec![],
        settings: vec![
            toggle(
                keys::ONBOARDING_COMPLETE,
                "Setup complete",
                "Whether first-run setup has been finished.",
                SettingSection::General,
                false,
            ),
            number(
                keys::ONBOARDING_STEP_INDEX,
                "Setup step index",
                "Last completed step in the onboarding flow.",
                SettingSection::General,
                (0.0, 10.0, 1.0),
                None,
                0.0,
            ),
            toggle(
                keys::TUTORIAL_COMPLETE,
                "Tutorial complete",
                "Whether the interactive dictation tutorial has been completed or skipped.",
                SettingSection::General,
                false,
            ),
        ],
    }
}
