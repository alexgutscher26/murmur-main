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
import { openUrl } from "@tauri-apps/plugin-opener";
import { commands } from "@/lib/bindings";
import { unwrapCommand, useCommand } from "@/lib/ipc";
import { Gift, Copy, Check } from "lucide-react";

type ProBillingCycle = "lifetime" | "annual";

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

  const [proBilling, setProBilling] = useState<ProBillingCycle>("lifetime");
  const [inputKey, setInputKey] = useState("");
  const [keyError, setKeyError] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const referralStatus = useCommand(commands.getReferralStatus, []);

  const handleCopyReferral = () => {
    const url =
      referralStatus.data?.referral_url || "https://murmur.app/pricing";
    void unwrapCommand(() => commands.copyText({ text: url })).then(() => {
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    });
  };

  const handleOpenLink = async (url: string) => {
    try {
      await openUrl(url);
    } catch {
      window.open(url, "_blank");
    }
  };

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
    period: string;
    subtext: string;
    description: string;
    features: { name: string; included: boolean }[];
  }[] = [
    {
      id: "starter",
      name: "Free",
      badge: "Free forever",
      price: "$0",
      period: "forever",
      subtext: "100% on-device · Zero cloud needed",
      description: "Fast local dictation for individuals. Experience sub-200ms transcription directly on your hardware.",
      features: [
        { name: "100% on-device Whisper Base model", included: true },
        { name: "Sub-200ms instantaneous transcription", included: true },
        { name: "Universal global hotkey (⌥Space / Alt+Space)", included: true },
        { name: "Standard punctuation & raw text insertion", included: true },
        { name: "macOS (Metal) & Windows (DirectML) native", included: true },
        { name: "Audio and transcripts never leave RAM", included: true },
        { name: "Up to 25 custom dictionary words", included: true },
        { name: "Whisper Large v3 Turbo & Medium models", included: false },
        { name: "Smart Context Engine (VS Code, Slack, Notion, Mail)", included: false },
        { name: "Automatic filler word stripper (removes ums/ahs)", included: false },
        { name: "Per-app writing styles & voice snippets", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      badge: proBilling === "lifetime" ? "Perpetual · Best Value" : "Most Flexible",
      price: proBilling === "lifetime" ? "$89" : "$49",
      period: proBilling === "lifetime" ? "one-time" : "/ year",
      subtext:
        proBilling === "lifetime"
          ? "Pay once · Own forever · 1 yr updates included"
          : "Equivalent to $4.08/mo · Continuous updates",
      description: "For professionals who write daily and want peak accuracy, custom jargon, and context awareness.",
      features: [
        { name: "Everything included in Free", included: true },
        { name: "Whisper Large v3 Turbo & Medium models", included: true },
        { name: "Smart Context Engine (VS Code, Slack, Notion, Mail)", included: true },
        { name: "Custom dictionary for technical terms & client names", included: true },
        { name: "Automatic filler word stripper (removes ums/ahs)", included: true },
        { name: "Works 100% offline & air-gap verified", included: true },
        { name: "Valid on 2 personal devices (macOS & Windows)", included: true },
        { name: "Continuous performance tuning & model drops", included: true },
        { name: "Voice snippets and text expansions", included: true },
        { name: "Spoken editing commands & punctuation macros", included: true },
      ],
    },
    {
      id: "team",
      name: "Team",
      badge: "For Organizations",
      price: "$15",
      period: "/ seat / mo",
      subtext: "Billed annually · Commercial license",
      description: "Admin deployment, shared organizational vocabularies, and compliance guarantees for teams.",
      features: [
        { name: "Everything in Pro included for all seats", included: true },
        { name: "Admin deployment via MSIX & PKG installers", included: true },
        { name: "Centralized team dictionary & shared prompt packs", included: true },
        { name: "Commercial-use rights & volume seat licensing", included: true },
        { name: "Tamper-evident local compliance audit log", included: true },
        { name: "Priority business SLA & dedicated support", included: true },
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
              {tier === "starter" ? "Free Tier" : tier === "pro" ? "Murmur Pro" : "Team License"}
            </span>
            {isTrial && (
              <span className="hairline rounded-full bg-sunken px-2 py-0.5 text-caption text-text-secondary">
                {trialDaysRemaining} days left in trial
              </span>
            )}
          </div>
          <p className="text-body text-text-secondary">
            {tier === "starter"
              ? "You are using the Free tier with on-device Whisper Base model and sub-200ms latency."
              : tier === "pro"
              ? "All Pro features unlocked: Large v3 Turbo, Smart Context Engine, and Filler Word Stripper."
              : "Team organization license active with centralized dictionary sync and fleet management."}
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
              Switch to Free
            </button>
          )}
        </div>
      </div>

      {/* Switcher Guarantee Banner */}
      <div className="hairline rounded-card bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">⚡</span>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-body font-bold text-text-primary">
                Switching from Wispr Flow or Superwhisper?
              </span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.2 text-[10px] font-mono font-semibold">
                Save up to 40%
              </span>
            </div>
            <p className="text-caption text-text-secondary">
              Get 40% off Pro Annual ($29/yr) or $20 off Pro Lifetime ($69) with proof of subscription. Zero cloud compute taxes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleOpenLink("https://murmur.app/pricing")}
          className="hairline h-8 rounded-input bg-sunken px-3 text-caption font-semibold text-text-primary transition-colors hover:bg-sunken-strong shrink-0 cursor-pointer"
        >
          Claim Switcher Deal →
        </button>
      </div>

      {/* Student & OSS Grant Banner */}
      <div className="hairline rounded-card bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">🎓</span>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-body font-bold text-text-primary">
                Student or Open Source Developer?
              </span>
              <span className="rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 px-2 py-0.2 text-[10px] font-mono font-semibold">
                50% OFF Grant
              </span>
            </div>
            <p className="text-caption text-text-secondary">
              Get 50% off Pro Lifetime ($44) or Annual ($24/yr) with a .edu email or public GitHub repository.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleOpenLink("https://murmur.app/pricing")}
          className="hairline h-8 rounded-input bg-sunken px-3 text-caption font-semibold text-text-primary transition-colors hover:bg-sunken-strong shrink-0 cursor-pointer"
        >
          Apply for 50% Grant →
        </button>
      </div>

      {/* Post-Activation Referral Program Card */}
      <div className="hairline rounded-card bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-body font-bold text-text-primary">
                Post-Activation Referral Program
              </span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.2 text-[10px] font-mono font-semibold">
                {referralStatus.data?.eligible
                  ? "50+ Dictations Unlocked"
                  : `${referralStatus.data?.session_count ?? 0} / 50 Dictations`}
              </span>
            </div>
            <p className="text-caption text-text-secondary">
              Share your invite link with friends or colleagues. They receive a welcome discount, and you unlock developer prompt packs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyReferral}
            className="hairline h-8 rounded-input bg-sunken px-3 text-caption font-semibold text-text-primary transition-colors hover:bg-sunken-strong shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedReferral ? (
              <>
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* License Key Activation Box */}
      <div className="hairline rounded-card bg-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-label text-text-secondary uppercase tracking-wider">
            Activate License Key
          </p>
          <button
            type="button"
            onClick={() => handleOpenLink("https://murmur.app/pricing")}
            className="text-caption text-text-secondary hover:text-text-primary underline transition-colors"
          >
            Buy license on murmur.app ↗
          </button>
        </div>
        <form onSubmit={handleActivate} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="PRO-XXXX-XXXX, LIFETIME-XXXX, or STUDENT-XXXX"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="hairline h-9 flex-1 rounded-input bg-sunken px-3 font-mono text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-text-primary"
          />
          <button
            type="submit"
            className="hairline h-9 rounded-input bg-sunken px-4 text-body font-medium text-text-primary transition-colors hover:bg-sunken-strong shrink-0"
          >
            Activate Key
          </button>
        </form>
        {keySuccess && (
          <p className="text-caption font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            ✓ License key activated successfully! Plan updated to {tier.toUpperCase()}.
          </p>
        )}
        {keyError && (
          <p className="text-caption font-mono text-danger mt-2">
            ✕ Invalid key format. Enter a valid Murmur Pro, Team, Student, or Switcher key.
          </p>
        )}
        {licenseKey && (
          <p className="text-caption font-mono text-text-tertiary mt-2">
            Active Key: {licenseKey}
          </p>
        )}
      </div>

      {/* Pro Plan Billing Selector Toggle */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-body font-bold text-text-primary">Available Plans</h3>
        <div className="hairline inline-flex items-center p-0.5 rounded-full bg-sunken">
          <button
            type="button"
            onClick={() => setProBilling("lifetime")}
            className={`text-caption font-semibold px-3 py-1 rounded-full transition-all ${
              proBilling === "lifetime"
                ? "bg-text-primary text-opaque-elevated shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Lifetime License ($89)
          </button>
          <button
            type="button"
            onClick={() => setProBilling("annual")}
            className={`text-caption font-semibold px-3 py-1 rounded-full transition-all ${
              proBilling === "annual"
                ? "bg-text-primary text-opaque-elevated shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Annual Pass ($49/yr)
          </button>
        </div>
      </div>

      {/* 3 Streamlined Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isActive = tier === plan.id;
          const isPro = plan.id === "pro";

          return (
            <div
              key={plan.id}
              className={`hairline rounded-card p-5 flex flex-col justify-between transition-all ${
                isPro
                  ? "bg-elevated ring-1 ring-text-primary shadow-xs"
                  : isActive
                  ? "bg-elevated ring-1 ring-[var(--border-hairline)]"
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
                      <span className="hairline rounded-full bg-sunken px-2 py-0.5 text-caption text-text-secondary font-mono text-[11px]">
                        {plan.badge}
                      </span>
                    )
                  )}
                </div>

                <div className="my-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-display font-bold font-mono text-text-primary">
                      {plan.price}
                    </span>
                    <span className="text-caption font-mono text-text-tertiary">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-text-tertiary mt-0.5">
                    {plan.subtext}
                  </p>
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

              <div className="space-y-2">
                {isActive ? (
                  <div className="hairline w-full text-center text-caption font-semibold py-2 rounded-input bg-sunken text-text-primary">
                    Current Plan
                  </div>
                ) : isPro ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenLink("https://murmur.app/pricing")}
                      className="w-full text-center text-caption font-semibold py-2 rounded-input bg-text-primary text-opaque-elevated transition-opacity hover:opacity-90 shadow-xs"
                    >
                      Buy Pro License ({proBilling === "lifetime" ? "$89" : "$49/yr"}) ↗
                    </button>
                    {!isTrial && (
                      <button
                        type="button"
                        onClick={startTrial}
                        className="hairline w-full text-center text-caption font-semibold py-1.5 rounded-input bg-sunken text-text-secondary transition-colors hover:bg-sunken-strong hover:text-text-primary"
                      >
                        Try Free for 14 Days
                      </button>
                    )}
                  </>
                ) : plan.id === "team" ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenLink(
                        "mailto:sales@murmur.app?subject=Team%20Inquiry%20from%20Desktop%20App"
                      )
                    }
                    className="hairline w-full text-center text-caption font-semibold py-2 rounded-input bg-sunken text-text-primary transition-colors hover:bg-sunken-strong"
                  >
                    Contact Team Sales ↗
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTier(plan.id)}
                    className="hairline w-full text-center text-caption font-semibold py-2 rounded-input bg-sunken text-text-primary transition-colors hover:bg-sunken-strong"
                  >
                    Switch to Free
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Student & Open Source Grant Callout */}
      <div className="hairline rounded-card bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">🎓</span>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-body font-bold text-text-primary">
                Student & Open Source Developer Grant
              </span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.2 text-[10px] font-mono font-semibold">
                50% Flat Discount
              </span>
            </div>
            <p className="text-caption text-text-secondary">
              Eligible students, researchers (.edu), and GitHub OSS maintainers (50+ ★) get 50% off ($44 Lifetime or $24/yr).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            handleOpenLink(
              "mailto:support@murmur.app?subject=Student%2FOSS%20Discount%20Request&body=Hi%20Murmur%20Team%2C%0A%0AI%20am%20a%20student%20%2F%20OSS%20maintainer%20applying%20for%20the%2050%25%20grant.%0A%0AProof%20of%20enrollment%20or%20GitHub%20profile%3A%20%0A%0AThank%20you!"
            )
          }
          className="hairline h-8 rounded-input bg-sunken px-3 text-caption font-semibold text-text-primary transition-colors hover:bg-sunken-strong shrink-0"
        >
          Apply for 50% Off →
        </button>
      </div>
    </ScrollArea>
  );
}
