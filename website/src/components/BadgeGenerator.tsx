/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";

interface BadgeOption {
  id: string;
  name: string;
  badgeUrl: string;
  markdown: string;
  html: string;
  category: "badge" | "footer" | "template";
}

const BADGE_PRESETS: BadgeOption[] = [
  {
    id: "shield-default",
    name: "Dictated with Murmur (Brand)",
    badgeUrl: "https://img.shields.io/badge/dictated%20with-Murmur-5865F2?style=flat-square&logo=soundcharts&logoColor=white",
    markdown: "[![Dictated with Murmur](https://img.shields.io/badge/dictated%20with-Murmur-5865F2?style=flat-square&logo=soundcharts&logoColor=white)](https://murmur.app)",
    html: `<a href="https://murmur.app" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/dictated%20with-Murmur-5865F2?style=flat-square&logo=soundcharts&logoColor=white" alt="Dictated with Murmur" /></a>`,
    category: "badge",
  },
  {
    id: "shield-privacy",
    name: "100% Local Dictation (Privacy Shield)",
    badgeUrl: "https://img.shields.io/badge/voice-100%25%20Local-10B981?style=flat-square&logo=shield&logoColor=white",
    markdown: "[![100% Local Dictation](https://img.shields.io/badge/voice-100%25%20Local-10B981?style=flat-square&logo=shield&logoColor=white)](https://murmur.app/privacy)",
    html: `<a href="https://murmur.app/privacy" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/voice-100%25%20Local-10B981?style=flat-square&logo=shield&logoColor=white" alt="100% Local Dictation" /></a>`,
    category: "badge",
  },
  {
    id: "shield-dark",
    name: "Monochrome Dark",
    badgeUrl: "https://img.shields.io/badge/dictation-local%20whisper-18181B?style=flat-square",
    markdown: "[![Murmur](https://img.shields.io/badge/dictation-local%20whisper-18181B?style=flat-square)](https://murmur.app)",
    html: `<a href="https://murmur.app" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/dictation-local%20whisper-18181B?style=flat-square" alt="Murmur" /></a>`,
    category: "badge",
  },
];

const SNIPPET_MACROS = [
  {
    voiceTrigger: "bug template",
    title: "GitHub Bug Report Schema",
    preview: "### 🐛 Bug Report\n**Description:** ...\n**Steps to Reproduce:** ...",
    schema: `### 🐛 Bug Report\n**Description:**\n\n**Steps to Reproduce:**\n1. \n2. \n3. \n\n**Expected Behavior:**\n\n**Actual Behavior:**\n\n**Environment:**\n- OS:\n- Version:`,
  },
  {
    voiceTrigger: "status update",
    title: "Daily Standup Update",
    preview: "### 📋 Status Update\n**Yesterday:** ...\n**Today:** ...\n**Blockers:** None",
    schema: `### 📋 Status Update\n**Yesterday:**\n- \n\n**Today:**\n- \n\n**Blockers:**\n- None`,
  },
  {
    voiceTrigger: "pr template",
    title: "Pull Request Checklist",
    preview: "### 🚀 Pull Request\n**Summary:** ...\n**Key Changes:** ...\n**Testing Checklist:** ...",
    schema: `### 🚀 Pull Request\n**Summary:**\n\n**Key Changes:**\n- \n\n**Testing Checklist:**\n- [ ] Automated tests pass\n- [ ] Manual verification completed`,
  },
  {
    voiceTrigger: "meeting notes",
    title: "Meeting Notes & Action Items",
    preview: "### 📝 Meeting Notes\n**Date:** ...\n**Action Items:** ...",
    schema: `### 📝 Meeting Notes\n**Date:** \n**Attendees:** \n**Objective:** \n\n**Key Discussion Points:**\n- \n\n**Action Items:**\n- [ ]`,
  },
];

export function BadgeGenerator() {
  const [selectedBadge, setSelectedBadge] = useState<string>("shield-default");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activePreset = BADGE_PRESETS.find((b) => b.id === selectedBadge) || BADGE_PRESETS[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Product Virality & Open Source Badges
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          "Made with Local Dictation" Badges & Macros
        </h2>
        <p className="mt-3 text-base text-zinc-400 max-w-2xl mx-auto">
          Add exportable badges to your READMEs, PRs, and documentation. Use voice trigger words to instantly insert markdown schemas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Badges & Snippets */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🏷️</span> Exportable Badges for READMEs & PRs
            </h3>

            {/* Badge Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {BADGE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedBadge(preset.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedBadge === preset.id
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                  }`}
                >
                  <div className="text-xs font-medium text-zinc-300 mb-2 truncate">{preset.name}</div>
                  <img src={preset.badgeUrl} alt={preset.name} className="h-5" />
                </button>
              ))}
            </div>

            {/* Live Copy Panel */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                  <span>Markdown Embed (GitHub Issues & PRs)</span>
                  <button
                    onClick={() => handleCopy(activePreset.markdown, "md")}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {copiedKey === "md" ? "✓ Copied!" : "Copy Markdown"}
                  </button>
                </div>
                <pre className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto select-all">
                  {activePreset.markdown}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                  <span>HTML Embed (Docs & Web Pages)</span>
                  <button
                    onClick={() => handleCopy(activePreset.html, "html")}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {copiedKey === "html" ? "✓ Copied!" : "Copy HTML"}
                  </button>
                </div>
                <pre className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto select-all">
                  {activePreset.html}
                </pre>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                  <span>Subtle Italicized Footer</span>
                  <button
                    onClick={() =>
                      handleCopy("_Dictated privately on-device with [Murmur](https://murmur.app)_", "footer")
                    }
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {copiedKey === "footer" ? "✓ Copied!" : "Copy Footer"}
                  </button>
                </div>
                <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 italic">
                  _Dictated privately on-device with <span className="text-indigo-400 underline">Murmur</span>_
                </div>
              </div>
            </div>
          </div>

          {/* Referral Activation Card */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-purple-950/30 border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎁</span>
                  <h4 className="text-base font-bold text-white">Post-Activation Referral Program</h4>
                </div>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Earn lifetime rewards & Pro pack unlocks. Prompt triggers only after <strong>50 successful dictations</strong> (never during onboarding) when you've already experienced the value.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                50 Dictations Gate
              </span>
            </div>

            <div className="mt-4 p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3">
              <div className="font-mono text-xs text-indigo-300 truncate">
                https://murmur.app/invite?ref=MURMUR-8X7K9P
              </div>
              <button
                onClick={() =>
                  handleCopy("https://murmur.app/invite?ref=MURMUR-8X7K9P", "referral")
                }
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all whitespace-nowrap"
              >
                {copiedKey === "referral" ? "✓ Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Voice-Triggered Text Expander Macros */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🎙️</span> Voice-Triggered Macros
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Speak these trigger words during dictation to instantly expand structured markdown schemas:
            </p>
          </div>

          <div className="space-y-3">
            {SNIPPET_MACROS.map((macro, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{macro.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    "{macro.voiceTrigger}"
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 whitespace-pre-line bg-zinc-900/50 p-2 rounded border border-zinc-800/50 mb-2">
                  {macro.preview}
                </p>
                <button
                  onClick={() => handleCopy(macro.schema, `schema-${idx}`)}
                  className="w-full py-1 text-center text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded transition-all"
                >
                  {copiedKey === `schema-${idx}` ? "✓ Copied Schema" : "Copy Template"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
