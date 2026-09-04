/*!
 * SOURCE OF TRUTH KEYWORDS: capabilities_module, build_capabilities
 * WHAT:  Collects and builds all declared Capabilities from per-capability submodules.
 * WHY:   Keeps each capability's settings, hotkeys, metrics, and navigation modular and isolated.
 * WHERE: Consumed by registry/mod.rs.
 */

pub mod billing;
pub mod dictation;
pub mod dictionary;
pub mod helpers;
pub mod history;
pub mod insights;
pub mod models;
pub mod onboarding;
pub mod settings;
pub mod stats;
pub mod updates;

use crate::registry::capability::Capability;

pub fn build_capabilities() -> Vec<Capability> {
    vec![
        dictation::dictation_capability(),
        models::models_capability(),
        settings::settings_capability(),
        billing::billing_capability(),
        history::history_capability(),
        stats::stats_capability(),
        insights::insights_capability(),
        dictionary::dictionary_capability(),
        onboarding::onboarding_capability(),
        updates::updates_capability(),
    ]
}
