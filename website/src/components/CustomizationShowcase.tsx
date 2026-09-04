"use client";

import { useState } from "react";
import { Wrench, Terminal, Database, Sparkles, Check, ArrowRight } from "lucide-react";

interface CustomFeature {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  icon: typeof Terminal;
  exampleSpoken: string;
  exampleResult: string;
  description: string;
}

const CUSTOM_FEATURES: CustomFeature[] = [
  {
    id: "snippets",
    title: "Voice-Triggered Text Snippets & Macros",
    tagline: "Speak the trigger word, insert boilerplate instantaneously.",
    badge: "Voice Text-Expander",
    icon: Sparkles,
    exampleSpoken: "“insert bug template”",
    exampleResult: `### [Bug]: Title
- **Steps to Reproduce:**
  1. Open dashboard settings
  2. Toggle Air-Gap mode
- **Expected:** Sockets close immediately
- **Actual:** Verified 0 bytes egress
- **Environment:** Murmur v1.2 · macOS Sonoma`,
    description: "Define vocal expanders. When you say 'bug template', 'schedule link', or 'invoice address', Murmur replaces the phrase with your structured schema immediately.",
  },
  {
    id: "per-app",
    title: "Per-App Context Formatting Rules",
    tagline: "Speak once. Format automatically based on the target window.",
    badge: "App-Aware Rules",
    icon: Terminal,
    exampleSpoken: "“refactored auth token interceptor and added unit tests”",
    exampleResult: `// In Cursor / VS Code:
git commit -m "refactor(auth): update token interceptor and add unit tests"

// In Slack:
• Refactored auth token interceptor
• Added unit tests (all passing)`,
    description: "Write rules matching window process names. Code editors get conventional commit syntax and CamelCase; Slack gets clean bullet points and mentions.",
  },
  {
    id: "portable-dict",
    title: "Portable Personal & Project Dictionaries",
    tagline: "Your vocabulary is an asset you own—not a training signal for someone else’s model.",
    badge: "JSON / CSV Portable",
    icon: Database,
    exampleSpoken: "“pushed the direct ml crate to our internal cargo registry”",
    exampleResult: `Detected custom terms:
✓ [DirectML] (Windows ML acceleration)
✓ [crate] (Rust package)
✓ [Cargo] (Rust package manager)
Accuracy: 100% phonetic match`,
    description: "Export and import domain dictionaries as plain JSON or CSV files. Share team dictionaries in your git repo with zero data escaping to a cloud vendor.",
  },
  {
    id: "local-automation",
    title: "Local Automations & Pipeline Chaining",
    tagline: "Dictate → Local LLM Summarize → Route to Selected Window.",
    badge: "100% Local AI Pipeline",
    icon: Wrench,
    exampleSpoken: "“summarize this customer call in three key action items”",
    exampleResult: `1. Increase retention window to 14 days
2. Export team dictionary to JSON
3. Provide Little Snitch audit verification recipe`,
    description: "Chain your dictation into a lightweight local LLM (llama.cpp) for on-device summarization, grammar fixing, or translation before inserting into your cursor.",
  },
];

export function CustomizationShowcase() {
  const [activeFeature, setActiveFeature] = useState<CustomFeature>(CUSTOM_FEATURES[0]);

  return (
    <section id="customization" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Power-User Customization
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Own your customization.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Generic cloud dictation gives you one rigid output style. Murmur gives you complete local automation, vocal snippets, and portable dictionaries.
          </p>
        </div>

        {/* Feature Grid Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {CUSTOM_FEATURES.map((feat) => {
            const isSelected = activeFeature.id === feat.id;
            const Icon = feat.icon;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveFeature(feat)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-white/[0.08] border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.1)] scale-[1.01]"
                    : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span className="text-xs font-bold text-white">{feat.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-emerald-400 border border-white/[0.08]">
                    {feat.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  {feat.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Feature Interactive Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Live Configuration Preview
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">{activeFeature.title}</h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
              100% Local Logic
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
            {activeFeature.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1.5">
                Vocal Trigger / Voice Input
              </span>
              <p className="text-sm font-mono text-white font-semibold">
                {activeFeature.exampleSpoken}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060608] border border-white/[0.08] shadow-inner">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1.5">
                Target Window Output
              </span>
              <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {activeFeature.exampleResult}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
