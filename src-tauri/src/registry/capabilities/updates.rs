/*!
 * SOURCE OF TRUTH KEYWORDS: updates_capability, CapabilityKey::Updates
 * WHAT:  Declares signed Updates capability.
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::text;
use crate::registry::capability::{Capability, CapabilityKey};

pub fn updates_capability() -> Capability {
    Capability {
        key: CapabilityKey::Updates,
        name: text("Updates"),
        description: text("Signed updates from GitHub Releases."),
        requires: vec![],
        engine_needs: vec![],
        nav: None,
        hotkey: None,
        metrics: vec![],
        settings: vec![],
    }
}
