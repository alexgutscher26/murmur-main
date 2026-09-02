"use client";

const JOBS = [
  {
    job: "Protect sensitive ideas",
    quote: "“Your client notes, code, and private thoughts stay yours.”",
    feature: "Local-first architecture",
    audience: "Lawyers, therapists, founders & developers",
    description:
      "Unlike cloud dictation tools that upload audio to remote servers for transcription and AI training, Murmur executes 100% on your local CPU/GPU. No remote database, no audio logs.",
    pill: "Zero cloud telemetry",
    pillDetail: "0 bytes sent",
  },
  {
    job: "Write emails & messages faster",
    quote: "“Speak the messy first draft. Paste the polished version.”",
    feature: "Instant clean-up & formatting",
    audience: "Busy operators, executives & consultants",
    description:
      "Murmur automatically strips filler words (um, uh, like), corrects run-on sentences, and injects proper paragraphs so what you paste is already finalized.",
    pill: "Smart cleanup",
    pillDetail: "Auto-punctuation",
  },
  {
    job: "Dictate in every app",
    quote: "“One shortcut works wherever you write.”",
    feature: "Universal global hotkey",
    audience: "Slack, Cursor, Word, Notion & Gmail users",
    description:
      "Press Option+Space (macOS) or Alt+Space (Windows) in any text field. Speak naturally, release, and text pastes immediately at your cursor without losing focus.",
    pill: "Universal hook",
    pillDetail: "⌥Space / Alt+Space",
  },
  {
    job: "Work while traveling",
    quote: "“Dictate on a plane, in a hotel, or anywhere Wi-Fi fails.”",
    feature: "100% offline transcription",
    audience: "Frequent travelers & air-gapped environments",
    description:
      "Whisper model weights run completely offline on device. Transcribe on 30,000 feet flights or in high-security air-gapped office networks with zero internet connection.",
    pill: "Offline mode",
    pillDetail: "100% local model",
  },
  {
    job: "Handle jargon correctly",
    quote: "“Teach it client names, code terms, medications, or product names.”",
    feature: "Phonetic dictionary biasing",
    audience: "Engineers, medical teams & specialized domains",
    description:
      "Add proprietary names, code symbols, technical acronyms, or rare medication names. Murmur biases recognition weights to achieve flawless accuracy.",
    pill: "Custom dictionary",
    pillDetail: "Phonetic biasing",
  },
  {
    job: "Use multiple languages",
    quote: "“Private dictation in the languages you actually use.”",
    feature: "99 local language models",
    audience: "Multilingual teams & global professionals",
    description:
      "Automatic language detection across 99 languages. Dictate in Spanish, German, Japanese, French, or English without reconfiguring settings.",
    pill: "Multilingual",
    pillDetail: "99 languages",
  },
];

export function FeatureBento() {
  return (
    <section id="features" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 block mb-2">
            Built for High-Trust Workflows
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Features that solve real daily jobs.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Built for developers, lawyers, healthcare professionals, and founders who cannot—and will not—stream sensitive voice data to the cloud.
          </p>
        </div>

        {/* Bento Grid (B3 & B4: Flat cards #181818, full borders #313131, nested radius) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JOBS.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#181818] border border-[#313131] flex flex-col justify-between hover:border-white/30 transition-all duration-500"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                    {item.job}
                  </span>
                  <span className="text-[11px] font-mono text-white/40">
                    {item.feature}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2 italic">
                  {item.quote}
                </h3>

                <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="mb-6 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#222222] border border-[#313131] text-[11px] text-white/60">
                  <span className="text-white/40">Ideal for:</span>
                  <span className="text-white/80 font-medium">{item.audience}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131] flex items-center justify-between text-xs font-mono text-white/80">
                <span>{item.pill}</span>
                <span className="text-emerald-400 font-semibold">{item.pillDetail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

