/*!
 * SOURCE OF TRUTH KEYWORDS: models_capability, CapabilityKey::Models
 * WHAT:  Declares the speech recognition Models capability and language detection settings.
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::{choice, dynamic_choice, number, text, toggle};
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
            choice(
                keys::TRANSCRIPTION_ENGINE,
                "Speech Recognition Engine",
                "Choose between standard Whisper, ultra-fast NVIDIA Parakeet (sub-50ms), or intelligent Dual-Engine auto-switching.",
                SettingSection::Transcription,
                &[
                    ("auto", "Dual Engine (Auto Fast-Tier)", "Sub-50ms Parakeet for English, 99-language Whisper for multilingual."),
                    ("whisper", "Whisper ASR", "Full 99-language coverage with Whisper.cpp models."),
                    ("parakeet", "NVIDIA Parakeet (Fast Tier)", "DirectML-accelerated non-autoregressive streaming dictation for English."),
                ],
                "auto",
            ),
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
                description: text("Pin your language for a little more speed and accuracy, or let HushWrite detect it."),
                section: SettingSection::Transcription,
                kind: SettingKind::DynamicChoice {
                    source: ChoiceSource::Languages,
                },
                default: SettingValue::Choice(text("auto")),
                requires_engine: vec![EngineFeature::LanguageAutoDetect],
                requires_permission: vec![],
                advanced: false,
            },
            toggle(
                keys::TRANSCRIPTION_AUTO_ESCALATE,
                "Adaptive Model Auto-Switching",
                "Automatically upgrade low-confidence or high-noise segments to a more powerful model.",
                SettingSection::Transcription,
                false,
            ),
            dynamic_choice(
                keys::TRANSCRIPTION_ESCALATE_MODEL,
                "Escalation Model Tier",
                "The high-capacity model to escalate to when speech is difficult or precision is needed (e.g., large-v3-turbo).",
                SettingSection::Transcription,
                ChoiceSource::Models,
                "large-v3-turbo",
            ),
            number(
                keys::TRANSCRIPTION_CONFIDENCE_THRESHOLD,
                "Confidence Threshold",
                "Confidence score below which HushWrite escalates to the higher tier model.",
                SettingSection::Transcription,
                (0.40, 0.95, 0.05),
                Some("score"),
                0.70,
            ),
            toggle(
                keys::TRANSCRIPTION_APP_AWARE_ESCALATE,
                "App-Aware Precision Escalation",
                "Pre-emptively use the high-precision model when focused on code editors, IDEs, or terminals.",
                SettingSection::Transcription,
                true,
            ),
        ],
    }
}
