/*!
 * SOURCE OF TRUTH KEYWORDS: dictionary_capability, CapabilityKey::Dictionary
 * WHAT:  Declares custom vocabulary / dictionary capability.
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::text;
use crate::registry::capability::{Capability, CapabilityKey, NavDef};
use crate::types::EngineFeature;

pub fn dictionary_capability() -> Capability {
    Capability {
        key: CapabilityKey::Dictionary,
        name: text("Dictionary"),
        description: text("Names and jargon the model keeps getting wrong, and what they should be."),
        requires: vec![],
        // Prompting the engine with these terms is what fixes recognition
        // rather than patching the output, so the feature declares it.
        engine_needs: vec![EngineFeature::InitialPrompt],
        nav: Some(NavDef {
            label: text("Dictionary"),
            route: text("dictionary"),
            icon: text("BookOpen"),
            order: 25,
        }),
        hotkey: None,
        metrics: vec![],
        settings: vec![],
    }
}
