"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mark } from "@/components/Mark";
import { GithubIcon } from "@/components/GithubIcon";

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
    icon: "🎙️",
    title: "Brainstorm & Script Out Loud",
    desc: "Beat writer's block instantly. Talk through your ideas on a walk, in the car, or at your desk. Murmur formats your spoken thoughts into clean, structured prose.",
  },
  {
    icon: "🧠",
    title: "Give AI 10x More Context",
    desc: "Speak detailed, multi-paragraph prompts directly into ChatGPT, Claude, and Perplexity hands-free. Iterate on video ideas 4x faster without typing fatigue.",
  },
  {
    icon: "💬",
    title: "Engage With Your Audience Fast",
    desc: "Speed through YouTube comments, Instagram DMs, Substack replies, and Discord chats with natural, thoughtful voice replies.",
  },
  {
    icon: "🔒",
    title: "Protect Unreleased Creator IP",
    desc: "Unpublished scripts, confidential sponsor rates, book drafts, and unreleased video ideas stay 100% on your machine. Zero cloud training on your voice or concepts.",
  },
  {
    icon: "⚡",
    title: "Works Across Every Creator App",
    desc: "Direct native injection into Notion, Google Docs, Apple Notes, Scrivener, Word, Final Cut Pro, DaVinci Resolve, and Descript.",
  },
  {
    icon: "🏃‍♂️",
    title: "Mobile & Desktop Flexibility",
    desc: "Capture memos on the go with zero subscription fatigue. One-time purchase or free open source forever.",
  },
];

const CREATOR_COMPARISONS = [
  { feature: "Script & Idea Privacy", murmur: "100% On-Device (0 bytes cloud upload)", wispr: "Cloud streaming (Sent to servers)" },
  { feature: "Offline & Airplane Mode", murmur: "Full functionality without Wi-Fi", wispr: "Requires active Internet connection" },
  { feature: "Scriptwriting & Hook Templates", murmur: "Built-in voice macros (YouTube, Substack, Reels)", wispr: "Standard AI rewriting" },
  { feature: "AI Prompt Context Capacity", murmur: "Unlimited words, zero cloud throttle", wispr: "Cloud token limits & tiers" },
  { feature: "Audio Retention Policy", murmur: "Instantly freed from RAM (0 storage)", wispr: "Cloud server audio logs" },
  { feature: "Pricing Model", murmur: "Free Starter / $49 Lifetime perpetual", wispr: "$12/month ($144/year recurring)" },
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black">
      <Navbar />

      <main className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto space-y-24">
          {/* Hero Section */}
          <section className="text-center space-y-6 pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] border border-[#313131] text-xs font-mono text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Flow for Creators · 100% Private On-Device</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
              Turn Thoughts into Content, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">4x Faster</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Murmur gives creators hours back every week by replacing typing, editing, and creative friction with your natural voice. Draft scripts, generate viral hooks, and prompt AI without touching a keyboard.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/#download"
                className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-2 text-sm"
              >
                <span>Download Murmur Free</span>
                <span className="text-xs opacity-70">↓</span>
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-full bg-[#181818] text-white border border-[#313131] hover:bg-[#222222] transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <span>View Creator Lifetime Deal ($49)</span>
              </Link>
            </div>
          </section>

          {/* Interactive Creator Voice Simulator */}
          <section className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Interactive Creator Voice Templates</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Voice Macros
                  </span>
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Click a creator workflow below to see spoken voice triggers expand into structured content schemas.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CREATOR_DEMOS.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => setSelectedDemo(demo)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDemo.id === demo.id
                        ? "bg-white text-black font-semibold shadow"
                        : "bg-[#1f1f1f] text-white/70 hover:text-white border border-[#313131]"
                    }`}
                  >
                    {demo.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spoken Voice Input */}
              <div className="bg-[#181818] border border-[#2e2e2e] rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      What You Speak Out Loud
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#272727] text-white/60">
                      Mic Input
                    </span>
                  </div>
                  <p className="text-base text-white/90 font-mono leading-relaxed italic">
                    "{selectedDemo.spoken}"
                  </p>
                </div>

                <div className="text-xs text-white/40 font-mono">
                  Primary Apps: {selectedDemo.target}
                </div>
              </div>

              {/* Formatted Content Output */}
              <div className="bg-[#181818] border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Instant Formatted Draft
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#272727] text-white/80 hover:text-white border border-[#383838] transition-colors"
                    >
                      {copied ? "Copied! ✓" : "Copy Template"}
                    </button>
                  </div>
                  <pre className="text-sm font-mono text-white bg-[#0e0e0e] p-3 rounded-lg border border-[#222222] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {selectedDemo.output}
                  </pre>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-emerald-400/80">
                  <span>Type: {selectedDemo.badge}</span>
                  <span>Latency: &lt; 200ms DirectML/Metal</span>
                </div>
              </div>
            </div>
          </section>

          {/* Top 5 Ways Creators Use Murmur */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Top 5 Ways Content Creators Flow
              </h2>
              <p className="text-sm text-white/60 max-w-xl mx-auto">
                Move from idea to publish-ready content without getting trapped in typing friction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CREATOR_PILLARS.map((pillar, idx) => (
                <div
                  key={idx}
                  className="bg-[#141414] border border-[#262626] rounded-xl p-6 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="text-2xl">{pillar.icon}</div>
                  <h3 className="text-base font-semibold text-white">{pillar.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Creator IP & Privacy Callout */}
          <section className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#181818] border border-emerald-500/20 rounded-2xl p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xl">
                🛡️
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Why Top Creators Refuse Cloud Transcription</h3>
                <p className="text-xs text-white/60">Your unreleased scripts and brand deals are your livelihood.</p>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed max-w-3xl">
              Cloud dictation services upload your voice, audio recordings, and confidential draft text to external servers where they can be retained or used for third-party AI training. <strong>Murmur never touches the Internet.</strong> Your video ideas, client NDAs, sponsor pricing negotiations, and private creative drafts exist solely in your computer's memory.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/privacy"
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
              >
                Read our Zero-Telemetry Privacy Architecture →
              </Link>
            </div>
          </section>

          {/* Head-to-Head Comparison with Wispr Flow */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Murmur vs. Wispr Flow for Creators
              </h2>
              <p className="text-sm text-white/60 max-w-xl mx-auto">
                Compare local offline speech-to-text with cloud monthly subscriptions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-[#262626] rounded-xl overflow-hidden bg-[#121212] text-xs">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-[#262626] text-white/80 font-mono">
                    <th className="p-4">Feature / Privacy Guard</th>
                    <th className="p-4 text-emerald-400 font-bold">Murmur (100% On-Device)</th>
                    <th className="p-4 text-white/50">Wispr Flow (Cloud)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {CREATOR_COMPARISONS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#161616] transition-colors">
                      <td className="p-4 font-medium text-white/90">{row.feature}</td>
                      <td className="p-4 text-emerald-400 font-semibold">{row.murmur}</td>
                      <td className="p-4 text-white/50">{row.wispr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="bg-gradient-to-b from-[#181818] to-[#101010] border border-[#313131] rounded-2xl p-8 sm:p-12 text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#242424] border border-[#383838] flex items-center justify-center">
              <Mark size="md" animated={true} />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Start Creating at the Speed of Speech
              </h2>
              <p className="text-sm text-white/60">
                Join thousands of writers, YouTubers, and podcasters drafting 4x faster with Murmur.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/#download"
                className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all text-sm shadow-md"
              >
                Download Murmur Free
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-full bg-[#202020] text-white/80 border border-[#333333] hover:text-white transition-all text-sm"
              >
                Get Lifetime Access ($49)
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
