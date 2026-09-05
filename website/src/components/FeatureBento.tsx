"use client";

import { ShieldCheck, Zap, Globe, Command, WifiOff, Sparkles, Sliders } from "lucide-react";

const JOBS = [
  {
    job: "Write emails faster",
    quote: "“Speak the messy first draft. Paste the polished version.”",
    feature: "Clean-up and formatting",
    audience: "Busy operators, executives & consultants",
    description:
      "Speak freely with false starts and filler words. Murmur strips ums, ahs, and repetitions, injects proper punctuation, and outputs clean paragraphs ready to send.",
    pill: "Smart cleanup",
    pillDetail: "Auto-punctuation",
    icon: Sparkles,
  },
  {
    job: "Dictate in every app",
    quote: "“One shortcut works wherever you write.”",
    feature: "Global hotkey + universal insertion",
    audience: "Slack, Cursor, Word, Notion & Gmail users",
    description:
      "Press Option+Space (macOS) or Alt+Space (Windows) in any text field. Speak naturally and text pastes directly at your cursor via native OS input injection.",
    pill: "Universal hook",
    pillDetail: "⌥Space / Alt+Space",
    icon: Command,
  },
  {
    job: "Protect sensitive ideas",
    quote: "“Your client notes and private thoughts stay yours.”",
    feature: "Fully local processing",
    audience: "Lawyers, therapists, founders & developers",
    description:
      "Inference runs 100% on your local CPU/GPU using whisper.cpp. Audio is held only in RAM and deleted on decode. Zero cloud telemetry, zero remote databases.",
    pill: "Zero cloud telemetry",
    pillDetail: "0 bytes sent",
    icon: ShieldCheck,
  },
  {
    job: "Work while traveling",
    quote: "“Dictate on a plane, in a hotel, or anywhere Wi-Fi fails.”",
    feature: "Offline dictation",
    audience: "Frequent travelers & air-gapped environments",
    description:
      "Whisper weights execute completely offline on your device. Transcribe on 35,000-ft flights, in subways, or in secure air-gapped rooms with zero internet connection.",
    pill: "Offline mode",
    pillDetail: "100% local model",
    icon: WifiOff,
  },
  {
    job: "Handle jargon correctly",
    quote: "“Teach it client names, code terms, medications, or product names.”",
    feature: "Custom vocabulary / dictionary",
    audience: "Engineers, medical teams & specialized domains",
    description:
      "Add proprietary names, code symbols, technical acronyms, or medication terms. Murmur biases recognition weights to achieve flawless accuracy.",
    pill: "Custom dictionary",
    pillDetail: "Phonetic biasing",
    icon: Sliders,
  },
  {
    job: "Use multiple languages",
    quote: "“Private dictation in the languages you actually use.”",
    feature: "Local language models",
    audience: "Multilingual teams & global professionals",
    description:
      "Automatic language detection across 99 languages. Dictate in Spanish, German, Japanese, French, or English without cloud transmission or reconfiguring settings.",
    pill: "Multilingual",
    pillDetail: "99 languages",
    icon: Globe,
  },
];

export function FeatureBento() {
  return (
    <section id="features" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Built for High-Trust Workflows
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Features that solve real daily jobs.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Built for developers, lawyers, healthcare professionals, and founders who cannot—and will not—stream sensitive voice data to the cloud.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOBS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.16] flex flex-col justify-between transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-white/[0.04] text-emerald-400 border border-white/[0.08] group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      {item.feature}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {item.quote}
                  </h3>

                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="mb-6 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400">
                    <span className="text-zinc-500 font-mono">For:</span>
                    <span className="text-zinc-300 font-medium">{item.audience}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#060608] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-300">
                  <span>{item.pill}</span>
                  <span className="text-emerald-400 font-bold">{item.pillDetail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

