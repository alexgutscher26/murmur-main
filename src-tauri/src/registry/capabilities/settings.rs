/*!
 * SOURCE OF TRUTH KEYWORDS: settings_capability, CapabilityKey::Settings
 * WHAT:  Declares Output and General settings capability (paste, cleanup, pill, launch at login).
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::{advanced, choice, metric, needs_permission, number, text, toggle};
use crate::ports::permissions::OsPermission;
use crate::registry::capability::{Capability, CapabilityKey, NavDef, SettingSection};
use crate::registry::keys;
use crate::types::LatencyStage;

pub fn settings_capability() -> Capability {
    Capability {
        key: CapabilityKey::Settings,
        name: text("Output"),
        description: text("What happens to your words once they are transcribed."),
        // Accessibility is NOT required: without it delivery degrades to
        // clipboard-only, which is a supported outcome rather than a failure.
        requires: vec![],
        engine_needs: vec![],
        nav: Some(NavDef {
            label: text("Settings"),
            route: text("settings"),
            icon: text("Settings"),
            order: 30,
        }),
        hotkey: None,
        metrics: vec![
            metric(LatencyStage::ClipboardWrite, "Clipboard", false),
            metric(LatencyStage::Inject, "Paste", false),
        ],
        settings: vec![
            needs_permission(
                toggle(
                    keys::AUTO_PASTE,
                    "Paste automatically",
                    "Paste into whatever had focus. Turn this off to only copy to the clipboard.",
                    SettingSection::Output,
                    true,
                ),
                OsPermission::Accessibility,
            ),
            needs_permission(
                toggle(
                    keys::RESTORE_CLIPBOARD,
                    "Restore my clipboard",
                    "Put back what was on the clipboard after pasting. Turn this off if pastes arrive empty in a particular app.",
                    SettingSection::Output,
                    true,
                ),
                OsPermission::Accessibility,
            ),
            advanced(number(
                keys::PASTE_DELAY_MS,
                "Paste delay",
                "How long to wait after writing the clipboard before pasting. Raise it if an app pastes stale text.",
                SettingSection::Output,
                (0.0, 500.0, 5.0),
                Some("ms"),
                40.0,
            )),
            advanced(number(
                keys::CLIPBOARD_RESTORE_DELAY_MS,
                "Clipboard restore delay",
                "How long to wait after pasting before restoring the clipboard.",
                SettingSection::Output,
                (0.0, 1000.0, 10.0),
                Some("ms"),
                150.0,
            )),
            toggle(
                keys::CAPITALISE_SENTENCES,
                "Capitalise sentences",
                "Start each sentence with a capital letter.",
                SettingSection::Output,
                true,
            ),
            toggle(
                keys::NORMALISE_PUNCTUATION,
                "Tidy punctuation",
                "Normalise spacing, quotes and terminal punctuation.",
                SettingSection::Output,
                true,
            ),
            toggle(
                keys::STRIP_FILLERS,
                "Remove filler words",
                "Drop “um”, “uh”, “you know” and similar so speech reads like writing.",
                SettingSection::Output,
                false,
            ),
            toggle(
                keys::SPOKEN_COMMANDS,
                "Spoken formatting",
                "Turn “new line”, “new paragraph”, “comma” and “period” into the thing you said.",
                SettingSection::Output,
                true,
            ),
            toggle(
                keys::APPLY_CORRECTIONS,
                "Apply spoken corrections",
                "When you correct yourself out loud — \u{201c}Tuesday, sorry, I meant Wednesday\u{201d} — keep only the correction. It matches spoken phrases like \u{201c}I meant\u{201d} and \u{201c}make that\u{201d}; it does not rewrite your wording.",
                SettingSection::Output,
                false,
            ),
            toggle(
                keys::LAUNCH_AT_LOGIN,
                "Launch at login",
                "Start Murmur automatically when you log in.",
                SettingSection::General,
                false,
            ),
            number(
                keys::BASELINE_WPM,
                "Your typing speed",
                "Used to work out how much time dictation has saved you.",
                SettingSection::General,
                (10.0, 200.0, 1.0),
                Some("wpm"),
                40.0,
            ),
            number(
                keys::PILL_OPACITY,
                "Pill opacity",
                "Adjust background opacity of the floating pill from 30% to 100%.",
                SettingSection::General,
                (30.0, 100.0, 5.0),
                Some("%"),
                100.0,
            ),
            toggle(
                keys::PILL_COMPACT,
                "Compact pill mode",
                "Show a minimal icon-only pill indicator while dictating.",
                SettingSection::General,
                false,
            ),
            toggle(
                keys::CHECK_UPDATES,
                "Check for updates",
                "Check for a new version on launch and once a day. This is the only network request Murmur makes after setup.",
                SettingSection::General,
                true,
            ),
            choice(
                keys::UPDATE_CHANNEL,
                "Update channel",
                "Select which update channel Murmur checks for new desktop releases.",
                SettingSection::General,
                &[
                    ("stable", "Stable", "Official thoroughly tested production releases."),
                    ("beta", "Beta", "Pre-release builds with early access to new models and features."),
                ],
                "stable",
            ),
        ],
    }
}
