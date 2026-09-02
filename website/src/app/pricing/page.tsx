"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type BillingCycle = "annual" | "monthly" | "lifetime";

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: string;
  annualPrice: string;
  annualBilled: string;
  lifetimePrice: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  isPrimary: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "Free forever",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualBilled: "Free forever with zero subscription",
    lifetimePrice: "$0",
    period: "forever",
    description: "Free forever for basic private dictation. Ideal to prove the product on your machine.",
    features: [
      "100% on-device Whisper AI inference",
      "Whisper Base and Small models included",
      "Global shortcut (⌥Space / Alt+Space)",
      "Standard punctuation and capitalization",
      "Up to 25 custom dictionary jargon words",
      "100 recent searchable local history items",
      "macOS and Windows 10/11 support",
      "Audio and transcripts never uploaded",
    ],
    ctaText: "Download Free Forever",
    ctaHref: "/#download",
    isPrimary: false,
  },
  {
    id: "pro",
    name: "Founding Pro",
    badge: "Launch deal · Limited to 300 spots",
    monthlyPrice: "$8",
    annualPrice: "$49",
    annualBilled: "$49 / year (Includes continuous upgrades)",
    lifetimePrice: "$89",
    period: "one-time",
    description: "Upgrade when your work depends on it. Save 2+ hours daily with Turbo models and app-aware formatting.",
    features: [
      "Everything included in Starter",
      "Whisper Large v3 Turbo & Medium models",
      "Smart Context Engine (VS Code, Slack, Notion, Mail)",
      "Automatic filler word stripper (removes ums and ahs)",
      "Unlimited custom phonetic dictionary entries",
      "Voice snippets and text expansions",
      "Spoken editing commands (new line, delete sentence)",
      "Domain-specific vocabulary packs (code, legal, med)",
      "Continuous local model updates & OS tuning",
      "Lifetime license with all future updates",
    ],
    ctaText: "Claim Founding Lifetime Deal ($89)",
    ctaHref: "/#download",
    isPrimary: true,
  },
  {
    id: "team",
    name: "Teams & Enterprise",
    badge: "Coming soon",
    monthlyPrice: "$15",
    annualPrice: "$12",
    annualBilled: "Billed annually per team seat",
    lifetimePrice: "Custom",
    period: "per seat",
    description: "Team management and shared dictionaries after individual workflow features stabilize.",
    features: [
      "Everything in Pro for all team members",
      "Centralized shared team jargon dictionaries",
      "Floating license pool management console",
      "Pre-packaged MSIX and PKG enterprise installers",
      "Air-gapped internal model distribution",
      "Optional cross-device encrypted sync",
      "Dedicated technical onboarding and support",
    ],
    ctaText: "Join Team Waitlist",
    ctaHref: "mailto:sales@murmur.app?subject=Murmur%20Team%20Waitlist",
    isPrimary: false,
  },
];

const COMPARISON_SECTIONS = [
  {
    category: "Speech Recognition and Models",
    items: [
      { name: "100% on device local inference", starter: true, pro: true, team: true },
      { name: "Whisper Base and Small models", starter: true, pro: true, team: true },
      { name: "Whisper Large v3 Turbo (State of the art)", starter: false, pro: true, team: true },
      { name: "Hardware acceleration (Metal and DirectML)", starter: true, pro: true, team: true },
      { name: "Sub 200ms latency tail decodes", starter: true, pro: true, team: true },
      { name: "99 languages with auto detection", starter: true, pro: true, team: true },
    ],
  },
  {
    category: "Intelligent Formatting and Workflow",
    items: [
      { name: "Global shortcut in any desktop app", starter: true, pro: true, team: true },
      { name: "Smart Context Engine (IDE, Slack, Notion, Mail)", starter: false, pro: true, team: true },
      { name: "Automatic filler word removal", starter: false, pro: true, team: true },
      { name: "Custom jargon dictionary", starter: "25 words", pro: "Unlimited", team: "Unlimited" },
      { name: "Domain vocabulary packs (Legal, Medical, Dev)", starter: false, pro: true, team: true },
      { name: "Voice snippets and text expansions", starter: false, pro: true, team: true },
      { name: "Spoken editing commands", starter: false, pro: true, team: true },
      { name: "Searchable local SQLite history", starter: "100 items", pro: "Unlimited", team: "Unlimited" },
    ],
  },
  {
    category: "Sync, Updates, and Support",
    items: [
      { name: "Zero cloud audio upload guarantee", starter: true, pro: true, team: true },
      { name: "100% offline air gapped operation", starter: true, pro: true, team: true },
      { name: "Continuous OS compatibility & driver fixes", starter: "Standard", pro: "Priority", team: "Enterprise" },
      { name: "Optional encrypted cross-device sync", starter: false, pro: true, team: true },
      { name: "Pre-packaged MSIX and PKG installers", starter: false, pro: false, team: true },
      { name: "Central license management", starter: false, pro: false, team: true },
    ],
  },
];

const PRICING_FAQS = [
  {
    question: "Does the Pro plan still run speech recognition locally on my machine?",
    answer:
      "Yes, 100%. All audio capture, Voice Activity Detection, Whisper model inference, and text transformations execute strictly on your device GPU and CPU. Audio and transcripts are processed locally and never uploaded.",
  },
  {
    question: "What is the Freemium promise for Murmur Starter?",
    answer:
      "Free forever for basic private dictation. Starter includes Whisper Base and Small models with 25 custom dictionary terms and global shortcuts. You only upgrade to Pro when your work depends on advanced Large-v3 Turbo accuracy, Smart Context formatting, and domain vocabulary packs.",
  },
  {
    question: "How does the Founding Lifetime Deal ($89) work?",
    answer:
      "The Founding Pro deal is a one-time purchase of $89 (regular $129) limited to our first 300 customers. It gives you permanent lifetime access to all Pro capabilities and all future model/OS updates with zero recurring fees.",
  },
  {
    question: "Why would I pay for Pro or an Annual plan if compute runs on my computer?",
    answer:
      "You are paying for continuous engineering value: new local AI models, ongoing macOS and Windows driver optimizations, domain vocabulary packs, app-aware writing engines, and priority support. We never charge for access to text your computer has already generated.",
  },
  {
    question: "Can I use Murmur Starter or Pro commercially for business work?",
    answer:
      "Yes. Both Starter and Pro licenses permit full commercial and professional use in your day-to-day work.",
  },
  {
    question: "When will Team management and centralized dictionaries launch?",
    answer:
      "Team features are rolling out after individual power-user workflows stabilize, ensuring team deployments get battle-tested features.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("lifetime");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const renderValue = (val: boolean | string) => {
    if (typeof val === "boolean") {
      return val ? (
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
      ) : (
        <span className="text-xs font-mono text-white/30">✕</span>
      );
    }
    return <span className="text-xs font-mono font-medium text-white">{val}</span>;
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* Sticky Fluid Island Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-12 md:pt-44 md:pb-16 bg-[#000000] flex flex-col items-center text-center px-4">
        {/* Strong Freemium Promise Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-white/90">
            Free forever for basic private dictation. Upgrade when your work depends on it.
          </span>
        </div>

        <div className="max-w-[680px] mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gradient-hero mb-6">
            Invest in speed.
            <span className="block mt-1">Write with complete confidence.</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-normal">
            Save 2+ hours every day with app-ready voice typing. Choose our limited Founding Lifetime Deal or an optional Annual plan with ongoing model upgrades.
          </p>
        </div>

        {/* Billing Cycle Switcher with Lifetime as Default (Launch Offer) */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#181818] border border-[#313131]">
          <button
            onClick={() => setBillingCycle("lifetime")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              billingCycle === "lifetime"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>Founding Lifetime ($89)</span>
            <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Save $40
            </span>
          </button>

          <button
            onClick={() => setBillingCycle("annual")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              billingCycle === "annual"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>Pro Annual ($49/yr)</span>
          </button>

          <button
            onClick={() => setBillingCycle("monthly")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              billingCycle === "monthly"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Monthly ($8/mo)
          </button>
        </div>
      </section>

      {/* Pricing Cards Grid (B3: Nested radius formula, B4: Flat cards #181818) */}
      <section className="pb-24 bg-[#000000]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {PRICING_TIERS.map((tier) => {
              let displayPrice = tier.annualPrice;
              let displayPeriod = tier.period;
              let subtext = tier.annualBilled;

              if (tier.id === "starter") {
                displayPrice = "$0";
                displayPeriod = "forever";
                subtext = "Free forever with zero subscription";
              } else if (billingCycle === "monthly") {
                displayPrice = tier.monthlyPrice;
                displayPeriod = "per month";
                subtext = "Billed monthly, cancel anytime";
              } else if (billingCycle === "lifetime") {
                displayPrice = tier.lifetimePrice;
                displayPeriod = tier.id === "pro" ? "one time" : tier.period;
                subtext = tier.id === "pro" ? "Pay once, own forever with updates" : "Custom quote for team fleets";
              }

              return (
                <div
                  key={tier.id}
                  className={`p-6 sm:p-7 rounded-2xl border flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    tier.isPrimary
                      ? "bg-[#181818] border-white/50 shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
                      : "bg-[#181818] border-[#313131]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                      {tier.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#272727] text-white/80 border border-[#313131]">
                          {tier.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white">
                        {displayPrice}
                      </span>
                      <span className="text-xs font-mono text-white/50">
                        / {displayPeriod}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-white/50 mb-4">
                      {subtext}
                    </p>

                    <p className="text-xs text-white/70 leading-relaxed mb-6 font-normal">
                      {tier.description}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-[#313131] mb-8">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-1.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={tier.ctaHref}
                    target={tier.ctaHref.startsWith("http") ? "_blank" : undefined}
                    rel={tier.ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`w-full text-center text-sm font-semibold py-2.5 px-3 rounded-lg transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      tier.isPrimary
                        ? "text-black bg-white hover:bg-white/90"
                        : "text-white bg-[#1f1f1f] hover:bg-[#272727] border border-[#313131]"
                    }`}
                  >
                    {tier.ctaText}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Detailed Feature Comparison Table */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#181818] border border-[#313131] mb-16">
            <h2 className="text-xl font-bold text-white mb-6">
              Complete Feature Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#313131] text-xs">
                    <th className="pb-3 text-white/50 w-2/5 font-mono">Capability</th>
                    <th className="pb-3 text-center text-white w-1/5 font-mono">Starter ($0)</th>
                    <th className="pb-3 text-center text-white w-1/5 font-mono font-bold">Murmur Pro</th>
                    <th className="pb-3 text-center text-white/70 w-1/5 font-mono">Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#313131] text-xs">
                  {COMPARISON_SECTIONS.map((section, sIdx) => (
                    <React.Fragment key={`sec-${sIdx}`}>
                      <tr className="bg-[#1f1f1f]">
                        <td colSpan={4} className="py-2.5 px-3 font-mono font-bold text-white/60 text-[11px] uppercase tracking-wider">
                          {section.category}
                        </td>
                      </tr>
                      {section.items.map((item, iIdx) => (
                        <tr key={`item-${sIdx}-${iIdx}`} className="hover:bg-[#1f1f1f]/50 transition-colors">
                          <td className="py-3 px-3 text-white/80 font-medium">
                            {item.name}
                          </td>
                          <td className="py-3 text-center bg-[#1f1f1f]/20">
                            {renderValue(item.starter)}
                          </td>
                          <td className="py-3 text-center bg-[#1f1f1f]/40 font-semibold">
                            {renderValue(item.pro)}
                          </td>
                          <td className="py-3 text-center text-white/70">
                            {renderValue(item.team)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recurring Value Rationale Grid */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2b2b2b] mb-20">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 block mb-2">
                Honest Engineering Economics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                Value that justifies ongoing support.
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Even without cloud transcription server bills, you receive continuous value. Our pricing is for ongoing engineering improvements—never for access to text your computer already generates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#313131]">
                <span className="text-emerald-400 font-bold block mb-1">1. New Local AI Models</span>
                <p className="text-white/60 text-[11px] leading-normal font-sans">
                  Direct integration of upcoming quantized Whisper architectures and local LLM clean-up passes.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#313131]">
                <span className="text-emerald-400 font-bold block mb-1">2. OS & Driver Tuning</span>
                <p className="text-white/60 text-[11px] leading-normal font-sans">
                  Continuous compatibility with new macOS versions, Windows 11 updates, DirectML, and Metal GPU drivers.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#313131]">
                <span className="text-emerald-400 font-bold block mb-1">3. App-Aware Workflows</span>
                <p className="text-white/60 text-[11px] leading-normal font-sans">
                  Context formatting engines tailored for VS Code, Cursor, Slack, Notion, Word, and specialized software.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#313131]">
                <span className="text-emerald-400 font-bold block mb-1">4. Domain Vocabulary Packs</span>
                <p className="text-white/60 text-[11px] leading-normal font-sans">
                  Pre-compiled phonetic dictionaries for legal, medical, developer, consulting, and real estate jargon.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#313131]">
                <span className="text-emerald-400 font-bold block mb-1">5. Meeting Upgrades</span>
                <p className="text-white/60 text-[11px] leading-normal font-sans">
                  On-device speaker diarization, long-form meeting transcription, and searchable local SQLite archives.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#313131]">
                <span className="text-emerald-400 font-bold block mb-1">6. Optional Encrypted Sync</span>
                <p className="text-white/60 text-[11px] leading-normal font-sans">
                  End-to-end encrypted dictionary and snippet synchronization across multiple Mac and PC workstations.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
                Pricing FAQ
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Frequently asked questions about plans.
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {PRICING_FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#181818] border border-[#313131] overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                    >
                      <span className="text-sm sm:text-base font-bold text-white">
                        {faq.question}
                      </span>
                      <span className="text-xs font-mono text-white/50 px-2 py-0.5 rounded bg-[#272727]">
                        {isOpen ? "Hide" : "Show"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-[#272727] pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Final Download Banner */}
      <section className="py-20 bg-[#181818] border-t border-[#313131] text-center px-4">
        <div className="max-w-[680px] mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Try Murmur Pro free for 14 days.
          </h2>
          <p className="text-white/70 text-sm sm:text-base mb-8">
            Experience Large v3 Turbo, the Smart Context Engine, and instant local voice dictation with zero risk.
          </p>
          <a
            href="/#download"
            className="inline-block text-base font-semibold text-black bg-white hover:bg-white/90 px-6 py-2.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Download Murmur for macOS and Windows
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
