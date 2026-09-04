/*!
 * SOURCE OF TRUTH KEYWORDS: billing_capability, CapabilityKey::Billing, free_forever
 * WHAT:  A Billing page that exists to say there is nothing to pay for.
 * WHY:   The operator asked for it as a joke, and it is a good one
 *        precisely because a billing entry is the last thing a user of a
 *        local-first tool expects to find. It also answers a real
 *        question — people DO look for the pricing page — so the joke
 *        and the honest answer are the same page.
 * WHERE: Rendered from the registry by the dashboard shell.
 */

use super::helpers::text;
use crate::registry::capability::{Capability, CapabilityKey, NavDef};

pub fn billing_capability() -> Capability {
    Capability {
        key: CapabilityKey::Billing,
        name: text("Billing"),
        description: text("What Murmur costs, which is nothing."),
        requires: vec![],
        engine_needs: vec![],
        nav: Some(NavDef {
            label: text("Billing"),
            // Last in the sidebar. It is a punchline, not a feature.
            route: text("billing"),
            icon: text("CreditCard"),
            order: 40,
        }),
        hotkey: None,
        metrics: vec![],
        settings: vec![],
    }
}
