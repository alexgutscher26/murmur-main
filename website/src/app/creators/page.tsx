/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mark } from "@/components/Mark";
import {
  Mic,
  Video,
  Brain,
  MessageSquare,
  ShieldCheck,
  Layers,
  Smartphone,
  Copy,
  Check,
  Download,
  Sparkles,
  ArrowRight,
  FileText,
  Lock,
} from "lucide-react";

const CREATOR_DEMOS = [
  {
    id: "youtube-script",
    title: "YouTube Video Script",
    spoken: "youtube script template title why offline ai is the future of productivity",
    output: `### 🎬 YouTube Video Script
**Title Idea:** why offline ai is the future of productivity
**Hook (0:00 - 0:30):**

**Intro & Value Proposition:**

**Main Points:**
1. 
2. 
3. 

**Sponsor / Mid-roll CTA:**

**Conclusion & Next Video CTA:**`,
    target: "Google Docs / Notion / Word",
    badge: "Scriptwriting",
  },
  {
    id: "viral-hook",
    title: "3-Part Content Hook",
    spoken: "content hook template on how creators burn out from typing everything",
    output: `### 🪝 Content Hook Framework
**1. Curiosity Gap / Pattern Interrupt:**

**2. Stakes & Problem Statement:**

**3. Promise & Payoff:**`,
    target: "TikTok / Reels / Shorts",
    badge: "Hook Framework",
  },
  {
    id: "substack-draft",
    title: "Substack Newsletter",
    spoken: "substack draft on leaving cloud subscriptions for local tools",
    output: `### 💌 Newsletter Draft
**Subject Line Options:**
1. 
2. 

**Preview Text:**

**Core Essay:**

**Key Takeaways:**
- 

**Recommended Links:**
- `,
    target: "Substack / Beehiiv / Medium",
    badge: "Long-form",
  },
  {
    id: "social-caption",
    title: "Social Caption & Hashtags",
    spoken: "instagram caption template for today's desk setup video",
    output: `### 📱 Social Caption
**Hook Line:**

**Body / Story:**

**Call to Action:**
👉 

**Hashtags:**
# `,
    target: "Instagram / X / Threads",
    badge: "Social Media",
  },
  {
    id: "podcast-notes",
    title: "Podcast Episode Outline",
    spoken: "podcast show notes episode 84 with guest alex on local intelligence",
    output: `### 🎙️ Podcast Episode Outline
**Episode Title:** 
**Guest:** alex
**Core Theme:** local intelligence

**Discussion Questions:**
- 
- 
- 

**Key Timestamps:**
- 00:00 Intro
- 

**Links Mentioned:**
- `,
    target: "Descript / Spotify / Apple",
    badge: "Podcasting",
  },
  {
    id: "sponsor-read",
    title: "60s Sponsor Read",
    spoken: "sponsor read template for audio hardware partner",
    output: `### 📢 Sponsor Read (60s)
**Organic Transition:**

**Product Problem & Solution:**

**Personal Experience:**

**Offer & Discount Code:**

**Call to Action URL:**`,
    target: "Sponsorships & Ads",
    badge: "Monetization",
  },
];

const CREATOR_PILLARS = [
  {
    icon: <Mic className="w-5 h-5 text-emerald-600" />,
    title: "Brainstorm & Script Out Loud",
    desc: "Beat writer's block instantly. Talk through your ideas on a walk, in the car, or at your desk. Murmur formats your spoken thoughts into clean, structured prose.",
  },
  {
    icon: <Brain className="w-5 h-5 text-purple-500" />,
    title: "Give AI 10x More Context",
    desc: "Speak detailed, multi-paragraph prompts directly into ChatGPT, Claude, and Perplexity hands-free. Iterate on video ideas 4x faster without typing fatigue.",
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
    title: "Engage With Your Audience Fast",
    desc: "Speed through YouTube comments, Instagram DMs, Substack replies, and Discord chats with natural, thoughtful voice replies.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    title: "Protect Unreleased Creator IP",
    desc: "Unpublished scripts, confidential sponsor rates, book drafts, and unreleased video ideas stay 100% on your machine. Zero cloud training on your voice or concepts.",
  },
  {
    icon: <Layers className="w-5 h-5 text-amber-500" />,
    title: "Works Across Every Creator App",
    desc: "Direct native injection into Notion, Google Docs, Apple Notes, Scrivener, Word, Final Cut Pro, DaVinci Resolve, and Descript.",
  },
  {
    icon: <Smartphone className="w-5 h-5 text-neutral-800" />,
    title: "Mobile & Desktop Flexibility",
    desc: "Capture memos on the go with zero subscription fatigue. One-time purchase or free open source forever.",
  },
];

const CREATOR_COMPARISONS = [
  {
    feature: "Script & Idea Privacy",
    murmur: "100% On-Device (0 bytes cloud upload)",
    wispr: "Cloud streaming (Sent to servers)",
  },
  {
    feature: "Offline & Airplane Mode",
    murmur: "Full functionality without Wi-Fi",
    wispr: "Requires active Internet connection",
  },
  {
    feature: "Scriptwriting & Hook Templates",
    murmur: "Built-in voice macros (YouTube, Substack, Reels)",
    wispr: "Standard AI rewriting",
  },
  {
    feature: "AI Prompt Context Capacity",
    murmur: "Unlimited words, zero cloud throttle",
    wispr: "Cloud token limits & tiers",
  },
  {
    feature: "Audio Retention Policy",
    murmur: "Instantly freed from RAM (0 storage)",
    wispr: "Cloud server audio logs",
  },
  {
    feature: "Pricing Model",
    murmur: "Free Starter / $49 Lifetime perpetual",
    wispr: "$12/month ($144/year recurring)",
  },
];

export default function CreatorsPage() {
  const [selectedDemo, setSelectedDemo] = useState(CREATOR_DEMOS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedDemo.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white relative overflow-hidden">
      {/* Background ambient glow matching landing page */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-neutral-100 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching landing page */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      {/* Fluid Island Pill Navbar */}
      <Navbar />

      <div className="relative pt-36 pb-24 md:pt-44 md:pb-32 px-4 max-w-5xl mx-auto space-y-24 z-10">
        {/* Hero Section matching Landing Page */}
        <section className="text-center space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-xs font-mono font-medium text-neutral-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Flow for Creators · 100% Private On-Device</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.035em] text-neutral-950 max-w-4xl mx-auto leading-[1.06]">
            Turn thoughts into content,
            <span className="block text-[#737373] font-bold mt-1 sm:mt-2">4x faster.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Murmur gives creators hours back every week by replacing typing, editing, and creative
            friction with your natural voice. Draft scripts in{" "}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-800">
              Notion
            </span>
            {", "}generate viral hooks for{" "}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-800">
              YouTube
            </span>
            {", and "}prompt AI without touching a keyboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/#download"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#141416] hover:bg-neutral-800 text-white text-sm font-semibold shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Murmur Free</span>
              <span className="text-xs text-neutral-400 font-normal">Windows & Mac</span>
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-sm text-sm font-semibold text-neutral-800 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>View Creator Lifetime Deal ($49)</span>
              <ArrowRight className="w-4 h-4 text-neutral-500" />
            </Link>
          </div>
        </section>

        {/* Interactive Creator Voice Simulator matching InteractivePlayground style */}
        <section className="bg-neutral-50/90 border border-neutral-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 flex items-center gap-2.5">
                <span>Interactive Creator Voice Templates</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold">
                  Voice Macros
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Click a creator workflow below to see spoken voice triggers expand into structured
                content schemas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {CREATOR_DEMOS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setSelectedDemo(demo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedDemo.id === demo.id
                      ? "bg-neutral-950 text-white font-semibold shadow-sm"
                      : "bg-white text-neutral-600 hover:text-neutral-950 border border-neutral-200/80 hover:bg-neutral-100/80"
                  }`}
                >
                  {demo.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spoken Voice Input */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    What You Speak Out Loud
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                    Mic Input
                  </span>
                </div>
                <div className="bg-neutral-50/70 p-3.5 rounded-lg border border-neutral-100">
                  <p className="text-sm sm:text-base text-neutral-900 font-mono leading-relaxed italic">
                    "{selectedDemo.spoken}"
                  </p>
                </div>
              </div>

              <div className="text-xs text-neutral-500 font-mono pt-1">
                Primary Apps: {selectedDemo.target}
              </div>
            </div>

            {/* Formatted Content Output */}
            <div className="bg-white border border-neutral-200/90 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm ring-1 ring-emerald-500/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Instant Formatted Draft
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 border border-neutral-200 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs sm:text-sm font-mono text-neutral-100 bg-[#0e0e11] p-3.5 rounded-xl border border-neutral-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto shadow-inner selection:bg-neutral-800 selection:text-white">
                  {selectedDemo.output}
                </pre>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-neutral-600 pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200/60 font-medium">
                  Type: {selectedDemo.badge}
                </span>
                <span className="text-emerald-700 font-medium">
                  Latency: &lt; 200ms DirectML/Metal
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Top 5 Ways Content Creators Flow (Bento Grid) */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-medium text-neutral-800">
                Creator Workflows
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950">
              Top 5 Ways Content Creators Flow
            </h2>
            <p className="text-base text-neutral-600">
              Move from idea to publish-ready content without getting trapped in typing friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CREATOR_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200 space-y-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-neutral-100/90 border border-neutral-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {pillar.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950">{pillar.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Creator IP & Privacy Callout */}
        <section className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-8 sm:p-10 space-y-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white border border-emerald-200/80 text-emerald-800 flex items-center justify-center text-xl shadow-xs shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950">
                Why Top Creators Refuse Cloud Transcription
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                Your unreleased scripts and brand deals are your livelihood.
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed max-w-3xl">
            Cloud dictation services upload your voice, audio recordings, and confidential draft
            text to external servers where they can be retained or used for third-party AI
            training. <strong className="text-neutral-950 font-semibold">Murmur never touches the Internet.</strong> Your
            video ideas, client NDAs, sponsor pricing negotiations, and private creative drafts
            exist solely in your computer's memory.
          </p>

          <div className="pt-1">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
            >
              <span>Read our Zero-Telemetry Privacy Architecture</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Head-to-Head Comparison with Wispr Flow */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-medium text-neutral-800">
                100% On-Device vs. Cloud Subscriptions
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950">
              Murmur vs. Wispr Flow for Creators
            </h2>
            <p className="text-base text-neutral-600">
              Compare local offline speech-to-text with cloud monthly subscriptions.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-neutral-200/90 overflow-x-auto shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/80 font-mono text-xs text-neutral-900 uppercase tracking-wider">
                  <th className="p-4 sm:p-5 font-semibold">Feature / Privacy Guard</th>
                  <th className="p-4 sm:p-5 font-bold text-emerald-800 bg-emerald-50/30">
                    Murmur (100% On-Device)
                  </th>
                  <th className="p-4 sm:p-5 text-neutral-500 font-normal">Wispr Flow (Cloud)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {CREATOR_COMPARISONS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="p-4 sm:p-5 text-xs sm:text-sm font-medium text-neutral-900">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50/20">
                      {row.murmur}
                    </td>
                    <td className="p-4 sm:p-5 text-xs font-mono text-neutral-500">
                      {row.wispr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom CTA Banner matching landing page finish */}
        <section className="bg-[#141416] border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 text-white shadow-xl relative overflow-hidden">
          <div className="w-[500px] h-[250px] bg-gradient-to-r from-emerald-500/10 to-transparent rounded-full blur-3xl absolute -top-24 left-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center relative z-10">
            <Mark size="md" animated={true} />
          </div>

          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Start Creating at the Speed of Speech
            </h2>
            <p className="text-sm text-neutral-400">
              Join thousands of writers, YouTubers, and podcasters drafting 4x faster with Murmur.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 relative z-10">
            <Link
              href="/#download"
              className="px-7 py-3.5 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition-all text-sm shadow-md"
            >
              Download Murmur Free
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3.5 rounded-xl bg-neutral-800 text-white/90 border border-neutral-700 hover:text-white hover:bg-neutral-700 transition-all text-sm font-medium"
            >
              Get Lifetime Access ($49)
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
