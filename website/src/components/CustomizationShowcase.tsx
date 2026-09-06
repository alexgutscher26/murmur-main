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
    description:
      "Define vocal expanders. When you say 'bug template', 'schedule link', or 'invoice address', Murmur replaces the phrase with your structured schema immediately.",
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
    description:
      "Write rules matching window process names. Code editors get conventional commit syntax and CamelCase; Slack gets clean bullet points and mentions.",
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
    description:
      "Export and import domain dictionaries as plain JSON or CSV files. Share team dictionaries in your git repo with zero data escaping to a cloud vendor.",
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
    description:
      "Chain your dictation into a lightweight local LLM (llama.cpp) for on-device summarization, grammar fixing, or translation before inserting into your cursor.",
  },
];

export function CustomizationShowcase() {
  const [activeFeature, setActiveFeature] = useState<CustomFeature>(CUSTOM_FEATURES[0]);

  return (
    <section
      id="customization"
      className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-800">
              Power-User Customization
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Own your customization.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Generic cloud dictation gives you one rigid output style. Murmur gives you complete
            local automation, vocal snippets, and portable dictionaries.
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
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-neutral-50/80 border-neutral-900 shadow-[0_4px_16px_rgba(0,0,0,0.06)] scale-[1.01]"
                    : "bg-white text-neutral-600 border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/50 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-600" : "text-neutral-500"}`}
                    />
                    <span className="text-xs font-bold text-neutral-950">{feat.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold">
                    {feat.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed font-mono">{feat.tagline}</p>
              </button>
            );
          })}
        </div>

        {/* Active Feature Interactive Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-neutral-200/80">
            <div>
              <span className="text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                Live Configuration Preview
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950">
                {activeFeature.title}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200/80">
              100% Local Logic
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
            {activeFeature.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block mb-1.5">
                Vocal Trigger / Voice Input
              </span>
              <p className="text-sm font-mono text-neutral-900 font-semibold">
                {activeFeature.exampleSpoken}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 shadow-inner">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-1.5">
                Target Window Output
              </span>
              <pre className="text-xs font-mono text-neutral-200 whitespace-pre-wrap leading-relaxed">
                {activeFeature.exampleResult}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
