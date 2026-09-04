"use client";

import { useState } from "react";

interface CustomFeature {
  id: string;
  title: string;
  tagline: string;
  badge: string;
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
    <section id="customization" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 block mb-2">
            Built for Power Users & Developers
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Own your customization.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Generic cloud dictation gives you one rigid output style. Murmur gives you complete local automation, vocal snippets, and portable dictionaries.
          </p>
          <div className="mt-4 inline-block p-3 rounded-xl bg-[#141414] border border-[#272727]">
            <p className="text-xs sm:text-sm font-mono text-emerald-300">
              &ldquo;Your vocabulary is an asset you own—not a training signal for someone else&rsquo;s model.&rdquo;
            </p>
          </div>
        </div>

        {/* Feature Grid Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {CUSTOM_FEATURES.map((feat) => {
            const isSelected = activeFeature.id === feat.id;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveFeature(feat)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-[#1f1f1f] border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.06)]"
                    : "bg-[#141414] text-white/70 border-[#262626] hover:bg-[#191919] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white">{feat.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#272727] text-emerald-400 border border-[#333]">
                    {feat.badge}
                  </span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-mono">
                  {feat.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Feature Interactive Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2e2e2e]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Live Configuration Preview
            </span>
            <span className="text-[11px] font-mono text-white/40">100% Local Logic</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{activeFeature.title}</h3>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
            {activeFeature.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#1b1b1b] border border-[#2b2b2b]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50 block mb-1.5">
                Vocal Trigger / Voice Input
              </span>
              <p className="text-sm font-mono text-white font-semibold">
                {activeFeature.exampleSpoken}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0e0e] border border-emerald-500/30">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block mb-1.5">
                Target Window Output
              </span>
              <pre className="text-xs font-mono text-white/90 whitespace-pre-wrap leading-relaxed">
                {activeFeature.exampleResult}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
