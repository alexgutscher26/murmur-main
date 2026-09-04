/*!
 * SOURCE OF TRUTH KEYWORDS: registry_helpers, setting_constructors,
 *   toggle, number, choice, dynamic_choice, needs_permission, advanced, metric
 * WHAT:  Helper constructors for generating SettingDef, MetricDef, and HotkeyBinding.
 * WHY:   Keeps capability declarations readable as declarative tables rather than boilerplate.
 * WHERE: Consumed by capability files under registry/capabilities/.
 */

use crate::ports::permissions::OsPermission;
use crate::registry::capability::{MetricDef, SettingDef, SettingSection};
use crate::types::settings::{ChoiceSource, SettingChoice};
use crate::types::{HotkeyBinding, KeyModifier, LatencyStage, SettingKind, SettingValue};

pub fn text(value: &str) -> String {
    value.to_string()
}

pub fn toggle(
    key: &str,
    label: &str,
    description: &str,
    section: SettingSection,
    default: bool,
) -> SettingDef {
    SettingDef {
        key: text(key),
        label: text(label),
        description: text(description),
        section,
        kind: SettingKind::Toggle,
        default: SettingValue::Bool(default),
        requires_engine: vec![],
        requires_permission: vec![],
        advanced: false,
    }
}

pub fn number(
    key: &str,
    label: &str,
    description: &str,
    section: SettingSection,
    (min, max, step): (f64, f64, f64),
    unit: Option<&str>,
    default: f64,
) -> SettingDef {
    SettingDef {
        key: text(key),
        label: text(label),
        description: text(description),
        section,
        kind: SettingKind::Number {
            min,
            max,
            step,
            unit: unit.map(text),
        },
        default: SettingValue::Number(default),
        requires_engine: vec![],
        requires_permission: vec![],
        advanced: false,
    }
}

pub fn choice(
    key: &str,
    label: &str,
    description: &str,
    section: SettingSection,
    options: &[(&str, &str, &str)],
    default: &str,
) -> SettingDef {
    SettingDef {
        key: text(key),
        label: text(label),
        description: text(description),
        section,
        kind: SettingKind::Choice {
            options: options
                .iter()
                .map(|(value, label, description)| SettingChoice {
                    value: text(value),
                    label: text(label),
                    description: Some(text(description)),
                })
                .collect(),
        },
        default: SettingValue::Choice(text(default)),
        requires_engine: vec![],
        requires_permission: vec![],
        advanced: false,
    }
}

pub fn dynamic_choice(
    key: &str,
    label: &str,
    description: &str,
    section: SettingSection,
    source: ChoiceSource,
    default: &str,
) -> SettingDef {
    SettingDef {
        key: text(key),
        label: text(label),
        description: text(description),
        section,
        kind: SettingKind::DynamicChoice { source },
        default: SettingValue::Choice(text(default)),
        requires_engine: vec![],
        requires_permission: vec![],
        advanced: false,
    }
}

/// Marks a setting as depending on an OS grant. See SettingDef.
pub fn needs_permission(mut def: SettingDef, permission: OsPermission) -> SettingDef {
    def.requires_permission.push(permission);
    def
}

pub fn advanced(mut def: SettingDef) -> SettingDef {
    def.advanced = true;
    def
}

pub fn metric(stage: LatencyStage, label: &str, user_facing: bool) -> MetricDef {
    MetricDef {
        stage,
        label: text(label),
        user_facing,
    }
}

/// ⌥Space — the default dictation hotkey.
pub fn default_hotkey() -> HotkeyBinding {
    HotkeyBinding {
        modifiers: vec![KeyModifier::Option],
        key: text("Space"),
    }
}
