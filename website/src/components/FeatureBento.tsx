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
    <section id="features" className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white">
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
              Built for High-Trust Workflows
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Features that solve real daily jobs.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
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
                className="p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08)] flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-800 border border-neutral-200/80 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200/80 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                      {item.feature}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-950 mb-2 leading-snug">
                    {item.quote}
                  </h3>

                  <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="mb-6 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-600">
                    <span className="text-neutral-400 font-mono">For:</span>
                    <span className="text-neutral-800 font-medium">{item.audience}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs font-mono text-neutral-700">
                  <span>{item.pill}</span>
                  <span className="text-emerald-700 font-bold">{item.pillDetail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

