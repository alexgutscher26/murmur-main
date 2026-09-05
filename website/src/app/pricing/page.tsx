"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BadgeGenerator } from "@/components/BadgeGenerator";

type BillingCycle = "lifetime" | "annual" | "monthly";

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
    id: "free",
    name: "Free",
    badge: "Free Forever",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualBilled: "Free forever · 100% private core",
    lifetimePrice: "$0",
    period: "forever",
    description: "Private local dictation. Prove the sub-200ms speed on your machine with zero cloud processing.",
    features: [
      "100% on-device local Whisper dictation",
      "Basic model (Whisper Base quantized)",
      "Standard weekly dictation usage",
      "Single primary language dictation",
      "Standard punctuation & raw text insertion",
      "Universal global hotkey (⌥Space / Alt+Space)",
      "macOS (Metal) & Windows (DirectML) native",
      "Audio and transcripts never leave RAM",
    ],
    ctaText: "Download Free Forever",
    ctaHref: "/#download",
    isPrimary: false,
  },
  {
    id: "pro-lifetime",
    name: "Founding Pro Lifetime",
    badge: "Launch Offer · First 300 Users",
    monthlyPrice: "$8",
    annualPrice: "$49",
    annualBilled: "Launch deal: $89 once (Regular $129)",
    lifetimePrice: "$89",
    period: "one-time",
    description: "Private dictation forever on 1–2 devices, plus 1 full year of all software and model updates included.",
    features: [
      "Unlimited dictation & local transcription",
      "Premium models (Whisper Large v3 Turbo & Medium)",
      "Custom vocabulary for client names & jargon",
      "Per-app writing profiles (Slack, Mail, Code, Notes)",
      "Automatic filler word removal (strips ums/ahs)",
      "100% offline dictation & air-gap verified",
      "1–2 personal devices (macOS & Windows)",
      "All updates included for 1 full year",
    ],
    ctaText: "Claim Founding Pro ($89)",
    ctaHref: "/#download",
    isPrimary: true,
  },
  {
    id: "pro-annual",
    name: "Pro Annual",
    badge: "Continuous Updates",
    monthlyPrice: "$8",
    annualPrice: "$49",
    annualBilled: "$49 / year or $8 / month flexible",
    lifetimePrice: "$89",
    period: "flexible",
    description: "For professionals wanting continuous new model drops, OS compatibility tuning, and priority support.",
    features: [
      "Everything in Pro Lifetime included",
      "Continuous updates for new Whisper model releases",
      "OS compatibility & DirectML/Metal GPU driver tuning",
      "Voice commands & smart text transformations",
      "Automatic multi-language detection",
      "Local meeting transcription with speaker labeling",
      "Priority driver tuning & new local model drops",
      "Continuous feature updates & priority support",
    ],
    ctaText: "Start Pro Annual ($49/yr)",
    ctaHref: "/#download",
    isPrimary: false,
  },
  {
    id: "team-business",
    name: "Team / Business",
    badge: "Admin & Compliance",
    monthlyPrice: "$19",
    annualPrice: "$15",
    annualBilled: "$15 / user / month billed annually",
    lifetimePrice: "$149",
    period: "per seat",
    description: "Admin deployment, centralized preferences, priority support, and security compliance documentation.",
    features: [
      "Everything in Pro included for all seats",
      "Admin deployment via MSIX & PKG enterprise installers",
      "Centralized preferences & shared dictionary packs",
      "Commercial-use rights & volume seat licensing",
      "Signed physical data boundary attestation",
      "Tamper-evident local compliance audit log",
      "Priority business SLA & security documentation",
      "Dedicated technical onboarding engineer support",
    ],
    ctaText: "Contact Team Sales",
    ctaHref: "mailto:sales@murmur.app?subject=Team%20Inquiry",
    isPrimary: false,
  },
];

const COMMUNITY_PACKS = [
  {
    title: "VS Code & GitHub Engineering Pack",
    category: "Developer",
    badge: "Free Pack",
    downloads: "2.4k installs",
    description: "Conventional commit prefixes (feat:, fix:), CamelCase symbol conversion, and pull request markdown schemas.",
    example: "“insert pr template” → Markdown checklist with test coverage & reviewers",
  },
  {
    title: "Legal Brief & Privilege Drafting Pack",
    category: "Legal",
    badge: "Free Pack",
    downloads: "1.1k installs",
    description: "Confidentiality headers, Latin maxims (res judicata, habeas corpus), statutory formats, and client intake schemas.",
    example: "“insert privileged header” → CONFIDENTIAL ATTORNEY-CLIENT PRIVILEGED",
  },
  {
    title: "Customer Support & Fast Replies",
    category: "Operations",
    badge: "Free Pack",
    downloads: "1.8k installs",
    description: "Empathetic ticket signoffs, refund policy explanations, and structured reproduction step checklists.",
    example: "“insert refund snippet” → Formatted policy reply with order ID prompt",
  },
  {
    title: "Clinical SOAP Notes & Medical Terms",
    category: "Healthcare",
    badge: "Free Pack",
    downloads: "950 installs",
    description: "Subjective, Objective, Assessment, Plan (SOAP) layout with 400+ common medication phonetic mappings.",
    example: "“insert soap template” → Formatted clinical chart headers",
  },
];

const PRICING_FAQS = [
  {
    question: "Why use a hybrid model instead of subscription-only?",
    answer:
      "Because you supply your own hardware and audio never needs cloud GPU processing, subscription-only pricing feels misaligned unless it pays for continuous value. Our hybrid model gives you an affordable perpetual path (Founding Pro Lifetime) to own local dictation forever on your device, with an optional annual path ($49/yr) for those who want continuous new Whisper model drops, driver tuning, and domain packs.",
  },
  {
    question: "What updates are included with the Founding Pro Lifetime license?",
    answer:
      "Founding Pro includes private dictation forever on 1–2 devices, plus all software, driver, and model updates for 1 full year. We avoid promising 'lifetime updates' because it creates an unsustainable support obligation for a one-time payment. After year 1, your purchased version remains yours to use forever offline with zero subscriptions, and you can optionally renew an annual update pass ($39/year) whenever you want major new feature releases.",
  },
  {
    question: "Does the Pro plan still run 100% locally on my machine?",
    answer:
      "Yes, absolutely. Every feature across Free, Pro Lifetime, Pro Annual, and Team executes entirely within your physical machine's CPU/GPU via whisper.cpp. No audio, transcripts, or personal dictionaries are ever streamed to cloud servers.",
  },
  {
    question: "How does the Switcher Discount work?",
    answer:
      "If you currently subscribe to Wispr Flow, Superwhisper, or Dragon, you can claim 40% off your first year of Pro or $20 off Founding Pro Lifetime by showing an active receipt or account screenshot.",
  },
  {
    question: "Do you offer Student and Open Source Developer pricing?",
    answer:
      "Yes! Students, educators, and verified open-source maintainers receive a 50% discount ($44 for Founding Pro Lifetime, $24/yr for Pro Annual). Simply reach out with your student ID or GitHub profile.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("lifetime");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <main id="main-content" className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-12 md:pt-44 md:pb-16 bg-[#000000] flex flex-col items-center text-center px-4">
        {/* Value Proposition Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-white/90">
            Perpetual Core Ownership + Optional Pro Superpowers
          </span>
        </div>

        <div className="max-w-[740px] mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Invest in speed.
            <span className="block text-gradient-hero mt-1">Own your software forever.</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-normal">
            No mandatory recurring cloud compute taxes. Choose an affordable perpetual license for core private dictation, or upgrade to Pro for advanced local models and domain packs.
          </p>
        </div>

        {/* Switcher & Special Discounts Banner */}
        <div className="mb-10 p-3.5 rounded-2xl bg-[#141414] border border-[#292929] max-w-3xl w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-left">
            <span className="text-emerald-400 text-sm">⚡</span>
            <div>
              <span className="font-bold text-white">Migrating from Wispr Flow or Superwhisper?</span>
              <p className="text-white/60 text-[11px]">Get 40% off your first year or $20 off Lifetime with proof of subscription.</p>
            </div>
          </div>
          <Link
            href="mailto:support@murmur.app?subject=Switcher%20Discount%20Claim"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#2b2b2b] text-white/90 font-mono text-[11px] border border-[#383838] transition-colors"
          >
            Claim Switcher Deal →
          </Link>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#181818] border border-[#313131] mb-12">
          <button
            onClick={() => setBillingCycle("lifetime")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
              billingCycle === "lifetime"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>Lifetime Perpetual (Pay Once)</span>
            <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Best Value
            </span>
          </button>

          <button
            onClick={() => setBillingCycle("annual")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
              billingCycle === "annual"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>Pro Annual ($49/yr)</span>
          </button>

          <button
            onClick={() => setBillingCycle("monthly")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Monthly ($8/mo)
          </button>
        </div>

        {/* Pricing Cards Grid (4 Tiers: Starter, Core Perpetual, Pro, Privacy Pro) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full text-left mb-16">
          {PRICING_TIERS.map((tier) => {
            const displayPrice =
              billingCycle === "lifetime"
                ? tier.lifetimePrice
                : billingCycle === "annual"
                ? tier.annualPrice
                : tier.monthlyPrice;

            const periodLabel =
              billingCycle === "lifetime"
                ? tier.lifetimePrice === "$0" ? "forever" : "one-time"
                : billingCycle === "annual"
                ? "/ year"
                : "/ month";

            return (
              <div
                key={tier.id}
                className={`p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                  tier.isPrimary
                    ? "bg-[#181818] border-2 border-emerald-500/60 shadow-[0_0_32px_rgba(16,185,129,0.08)]"
                    : "bg-[#141414] border border-[#2a2a2a] hover:border-[#383838]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-white">{tier.name}</h3>
                    {tier.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        tier.isPrimary
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-[#222] text-white/70 border-[#333]"
                      }`}>
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold font-mono text-white">{displayPrice}</span>
                    <span className="text-xs text-white/50 font-mono ml-1">{periodLabel}</span>
                    <p className="text-[11px] text-white/40 font-mono mt-1">{tier.annualBilled}</p>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed mb-6 font-sans">
                    {tier.description}
                  </p>

                  <div className="space-y-2.5 mb-6 text-xs text-white/80">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tier.ctaHref}
                  className={`w-full py-2.5 rounded-full text-xs font-semibold text-center transition-all ${
                    tier.isPrimary
                      ? "bg-white text-black hover:bg-white/90 shadow-md"
                      : "bg-[#222222] hover:bg-[#2b2b2b] text-white border border-[#333]"
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Student / Open Source Discount Box */}
        <div className="max-w-4xl w-full p-4 rounded-xl bg-[#121212] border border-[#262626] mb-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-left">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎓</span>
            <div>
              <span className="text-white font-bold block">Student & Open Source Developer Plan</span>
              <span className="text-white/60 text-[11px]">50% discount ($29 Core Lifetime) for students, educators, and active OSS maintainers.</span>
            </div>
          </div>
          <Link
            href="mailto:support@murmur.app?subject=Student%2FOSS%20Discount%20Request"
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#272727] text-white border border-[#333] transition-colors"
          >
            Apply for 50% Off
          </Link>
        </div>

        {/* Virality: Shareable Vocabulary & Voice-Command Packs */}
        <div className="max-w-4xl w-full p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2c2c2c] mb-16 text-left">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1e1e1e] border border-[#333] text-[10px] font-mono text-emerald-400 mb-2">
              <span>📦</span> Shareable Workflows & Virality
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Public Voice-Command & Vocabulary Packs
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              Export your shortcuts or install curated community packs in one click. Your team can sync vocabularies via plain <code className="text-emerald-300">.murmur/pack.json</code> files.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {COMMUNITY_PACKS.map((pack, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#191919] border border-[#2e2e2e] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white">{pack.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#242424] text-emerald-400 border border-[#353535]">
                      {pack.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/65 leading-relaxed mb-3">{pack.description}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#0e0e0e] border border-[#242424] text-[11px] font-mono text-emerald-300/90 truncate">
                  {pack.example}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#101010] border border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70">
            <span>🎁 <strong>Referral Program:</strong> Dictate 50 times → Unlock your personal invite link to give friends free Pro packs.</span>
            <span className="font-mono text-emerald-400 text-[11px]">Zero spam · Triggered post-activation</span>
          </div>
        </div>

        {/* Badge & Macro Generator */}
        <BadgeGenerator />

        {/* FAQs */}
        <div className="max-w-3xl w-full text-left mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Pricing & Licensing FAQ</h2>
          <div className="space-y-3">
            {PRICING_FAQS.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[#141414] border border-[#272727]">
                <h3 className="text-sm font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
