/*!
 * SOURCE OF TRUTH KEYWORDS: insights_capability, CapabilityKey::Insights
 * WHAT:  Declares the Insights capability and its navigation entry.
 * WHY:   Insights shows a richer analytics view — WPM gauge, streak calendar,
 *        app usage breakdown, and corrections count — that the Stats page does
 *        not have room for. Both capabilities read from the same get_stats
 *        command; no new IPC is needed.
 * WHERE: Consumed by registry/capabilities/mod.rs.
 */

use super::helpers::text;
use crate::registry::capability::{Capability, CapabilityKey, NavDef};

pub fn insights_capability() -> Capability {
    Capability {
        key: CapabilityKey::Insights,
        name: text("Insights"),
        description: text("Rich analytics: WPM gauge, streak calendar, and app breakdown."),
        requires: vec![],
        engine_needs: vec![],
        nav: Some(NavDef {
            label: text("Insights"),
            route: text("insights"),
            icon: text("Gauge"),
            order: 15,
        }),
        hotkey: None,
        metrics: vec![],
        settings: vec![],
    }
}
