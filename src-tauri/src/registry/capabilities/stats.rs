/*!
 * SOURCE OF TRUTH KEYWORDS: stats_capability, CapabilityKey::Stats
 * WHAT:  Declares the Stats capability and its navigation entry.
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::text;
use crate::registry::capability::{Capability, CapabilityKey, NavDef};

pub fn stats_capability() -> Capability {
    Capability {
        key: CapabilityKey::Stats,
        name: text("Stats"),
        description: text("How much you have dictated, and how fast Murmur actually is."),
        requires: vec![],
        engine_needs: vec![],
        nav: Some(NavDef {
            label: text("Stats"),
            route: text("stats"),
            icon: text("ChartNoAxesColumn"),
            order: 10,
        }),
        hotkey: None,
        metrics: vec![],
        settings: vec![],
    }
}
