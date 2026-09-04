/*!
 * SOURCE OF TRUTH KEYWORDS: models_capability, CapabilityKey::Models
 * WHAT:  Declares the speech recognition Models capability and language detection settings.
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::{dynamic_choice, text};
use crate::registry::capability::{Capability, CapabilityKey, SettingDef, SettingSection};
use crate::registry::keys;
use crate::types::settings::ChoiceSource;
use crate::types::{EngineFeature, SettingKind, SettingValue};

pub fn models_capability() -> Capability {
    Capability {
        key: CapabilityKey::Models,
        name: text("Transcription"),
        description: text("The speech recognition model and the language it listens for."),
        requires: vec![],
        engine_needs: vec![],
        nav: None,
        hotkey: None,
        metrics: vec![],
        settings: vec![
            dynamic_choice(
                keys::TRANSCRIPTION_MODEL,
                "Model",
                "Larger models are more accurate; smaller ones use less memory.",
                SettingSection::Transcription,
                ChoiceSource::Models,
                "small-q5_1",
            ),
            SettingDef {
                key: text(keys::LANGUAGE),
                label: text("Language"),
                description: text("Pin your language for a little more speed and accuracy, or let Murmur detect it."),
                section: SettingSection::Transcription,
                kind: SettingKind::DynamicChoice {
                    source: ChoiceSource::Languages,
                },
                default: SettingValue::Choice(text("auto")),
                requires_engine: vec![EngineFeature::LanguageAutoDetect],
                requires_permission: vec![],
                advanced: false,
            },
        ],
    }
}
