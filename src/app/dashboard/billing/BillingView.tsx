/**
 * SOURCE OF TRUTH KEYWORDS: BillingView, usePlan, plan-management, feature-gates, design-tokens
 * WHAT:  The Plan & Billing management view in the Murmur desktop app.
 * WHY:   Uses Murmur's native design tokens (bg-surface, bg-elevated, hairline, text-text-primary)
 *        so it seamlessly matches the translucent glass aesthetics in light & dark modes.
 * WHERE: Routed from the capability registry's Billing nav entry.
 */

import { useState } from "react";
import { ScrollArea } from "@/components/global";
import { usePlan, PlanTier } from "@/lib/plan";

export function BillingView() {
  const {
    tier,
    isTrial,
    trialDaysRemaining,
    licenseKey,
    startTrial,
    setTier,
    activateLicense,
    resetToStarter,
  } = usePlan();

  const [inputKey, setInputKey] = useState("");
  const [keyError, setKeyError] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError(false);
    setKeySuccess(false);

    const success = activateLicense(inputKey);
    if (success) {
      setKeySuccess(true);
      setInputKey("");
    } else {
      setKeyError(true);
    }
  };

  const PLANS: {
    id: PlanTier;
    name: string;
    badge?: string;
    price: string;
    description: string;
    features: { name: string; included: boolean }[];
  }[] = [
    {
      id: "starter",
      name: "Starter",
      badge: "Free forever",
      price: "$0",
      description: "Free forever for basic private dictation. Upgrade when your work depends on it.",
      features: [
        { name: "100% on-device Whisper AI inference", included: true },
        { name: "Whisper Base and Small models", included: true },
        { name: "Global shortcut (Option / Alt Space)", included: true },
        { name: "Standard punctuation & capitalization", included: true },
        { name: "Up to 25 custom dictionary words", included: true },
        { name: "100 recent searchable history items", included: true },
        { name: "Whisper Large v3 Turbo & Medium models", included: false },
        { name: "Smart Context Engine (VS Code, Slack, Notion, Mail)", included: false },
        { name: "Automatic filler word stripper (removes ums/ahs)", included: false },
        { name: "Voice snippets and text expansions", included: false },
        { name: "Spoken editing commands (new line, delete sentence)", included: false },
        { name: "Domain-specific vocabulary packs (code, legal, med)", included: false },
      ],
    },
    {
      id: "pro",
      name: "Founding Pro",
      badge: "Launch deal · $89 Lifetime",
      price: "$89 one-time (or $49/yr)",
      description: "Save 2+ hours daily. App-aware formatting, Large Turbo models, and confidential writing.",
      features: [
        { name: "Everything included in Starter", included: true },
        { name: "Whisper Large v3 Turbo & Medium models", included: true },
        { name: "Smart Context Engine (VS Code, Slack, Notion, Mail)", included: true },
        { name: "Automatic filler word stripper (removes ums and ahs)", included: true },
        { name: "Unlimited custom phonetic dictionary entries", included: true },
        { name: "Voice snippets and text expansions", included: true },
        { name: "Spoken editing commands (new line, delete sentence)", included: true },
        { name: "Domain-specific vocabulary packs (code, legal, med)", included: true },
        { name: "Continuous local model updates & OS tuning", included: true },
        { name: "Lifetime license with all future updates", included: true },
      ],
    },
    {
      id: "team",
      name: "Team & Fleet",
      badge: "Coming soon",
      price: "$15 / user",
      description: "Centralized team management, shared dictionaries, and MSIX/PKG fleet deployment.",
      features: [
        { name: "Everything in Pro for all team members", included: true },
        { name: "Centralized team dictionary sync", included: true },
        { name: "Floating license pool management console", included: true },
        { name: "Pre-packaged MSIX and PKG installers", included: true },
        { name: "Air-gapped internal model distribution", included: true },
        { name: "SOC2 & HIPAA architectural compliance", included: true },
        { name: "Dedicated technical onboarding & support", included: true },
      ],
    },
  ];

  return (
    <ScrollArea contentClassName="flex flex-col gap-5 px-[var(--page-padding-x)] pb-8 max-w-5xl mx-auto">
      {/* Active Plan Header Banner */}
      <div className="hairline rounded-card bg-surface p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label text-text-tertiary uppercase tracking-wider">
              Current Plan
            </span>
            <span className="rounded-full bg-text-primary px-2.5 py-0.5 text-caption font-semibold text-opaque-elevated">
              {tier === "starter" ? "Starter (Free)" : tier === "pro" ? "Murmur Pro" : "Team License"}
            </span>
            {isTrial && (
              <span className="hairline rounded-full bg-sunken px-2 py-0.5 text-caption text-text-secondary">
                {trialDaysRemaining} days left in trial
              </span>
            )}
          </div>
          <p className="text-body text-text-secondary">
            {tier === "starter"
              ? "You are using the free Starter tier with on device Base and Small models."
              : tier === "pro"
              ? "All Pro features unlocked: Large v3 Turbo, Smart Context Engine, and Filler Stripper."
              : "Team organization license active with centralized dictionary sync."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {tier === "starter" && !isTrial && (
            <button
              type="button"
              onClick={startTrial}
              className="h-[var(--control-height)] rounded-input bg-text-primary px-4 text-body font-medium text-opaque-elevated transition-opacity hover:opacity-90"
            >
              Start 14-Day Free Trial
            </button>
          )}
          {tier !== "starter" && (
            <button
              type="button"
              onClick={resetToStarter}
              className="hairline h-[var(--control-height)] rounded-input bg-sunken px-3 text-body text-text-secondary transition-colors hover:bg-sunken-strong hover:text-text-primary"
            >
              Switch to Starter
            </button>
          )}
        </div>
      </div>

      {/* License Key Activation Box */}
      <div className="hairline rounded-card bg-surface p-4">
        <p className="text-label text-text-secondary uppercase tracking-wider mb-2">
          Activate License Key
        </p>
        <form onSubmit={handleActivate} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="PRO-XXXX-XXXX or TEAM-XXXX-XXXX"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="hairline h-9 flex-1 rounded-input bg-sunken px-3 font-mono text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-text-primary"
          />
          <button
            type="submit"
            className="hairline h-9 rounded-input bg-sunken px-4 text-body font-medium text-text-primary transition-colors hover:bg-sunken-strong shrink-0"
          >
            Activate
          </button>
        </form>
        {keySuccess && (
          <p className="text-caption font-mono text-text-primary mt-2">
            ✓ License key activated successfully! Plan updated to {tier.toUpperCase()}.
          </p>
        )}
        {keyError && (
          <p className="text-caption font-mono text-danger mt-2">
            ✕ Invalid key format. Enter a valid Murmur Pro or Team key.
          </p>
        )}
        {licenseKey && (
          <p className="text-caption font-mono text-text-tertiary mt-2">
            Active Key: {licenseKey}
          </p>
        )}
      </div>

      {/* Plans & Gating Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isActive = tier === plan.id;
          return (
            <div
              key={plan.id}
              className={`hairline rounded-card p-5 flex flex-col justify-between transition-all ${
                isActive
                  ? "bg-elevated ring-1 ring-text-primary"
                  : "bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-body font-bold text-text-primary">{plan.name}</h4>
                  {isActive ? (
                    <span className="rounded-full bg-text-primary px-2 py-0.5 text-caption font-semibold text-opaque-elevated">
                      Active
                    </span>
                  ) : (
                    plan.badge && (
                      <span className="hairline rounded-full bg-sunken px-2 py-0.5 text-caption text-text-secondary">
                        {plan.badge}
                      </span>
                    )
                  )}
                </div>

                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-display font-bold text-text-primary">
                    {plan.price}
                  </span>
                </div>

                <p className="text-caption text-text-secondary leading-relaxed mb-4">
                  {plan.description}
                </p>

                <div className="space-y-2 pt-3 border-t border-[var(--border-hairline)] mb-6">
                  {plan.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-caption ${
                        feat.included ? "text-text-primary" : "text-text-tertiary line-through"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          feat.included ? "bg-[var(--text-primary)]" : "bg-[var(--text-tertiary)]"
                        }`}
                      />
                      <span>{feat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {isActive ? (
                  <div className="hairline w-full text-center text-caption font-semibold py-2 rounded-input bg-sunken text-text-primary">
                    Current Plan
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTier(plan.id)}
                    className="hairline w-full text-center text-caption font-semibold py-2 rounded-input bg-sunken text-text-primary transition-colors hover:bg-sunken-strong"
                  >
                    Select {plan.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
