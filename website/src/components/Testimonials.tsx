"use client";

import { MessageSquareQuote, CheckCircle2, Star } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  tag: string;
  avatarInitial: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Murmur completely replaced cloud dictation tools for my daily engineering work. I write code comments, PR reviews, and Slack messages with my voice. Being 100% offline and free is an incredible achievement.",
    author: "Elena Rostova",
    role: "Staff Software Engineer",
    tag: "Engineering",
    avatarInitial: "E",
  },
  {
    quote:
      "As a physician, HIPAA compliance is strictly non-negotiable. I cannot use cloud speech tools. Murmur runs locally on my laptop with zero network traffic and recognizes medical terminology reliably.",
    author: "Dr. Julian Vance",
    role: "Clinical Neurologist",
    tag: "Healthcare",
    avatarInitial: "J",
  },
  {
    quote:
      "I dictated over 40,000 words of my latest manuscript with Murmur. The filler word removal cleans false starts without interrupting my natural drafting rhythm.",
    author: "Marcus Sterling",
    role: "Author & Essayist",
    tag: "Writing",
    avatarInitial: "M",
  },
  {
    quote:
      "Alt+Space on Windows with DirectML is instantaneous. The real time factor is under 0.20x. My wrist typing strain has completely disappeared.",
    author: "Siddharth Patel",
    role: "Lead Architect",
    tag: "Architecture",
    avatarInitial: "S",
  },
  {
    quote:
      "Murmur is faster than paid cloud alternatives because it eliminates the network latency roundtrip entirely. Solid native engineering in Rust.",
    author: "Chloe Dubois",
    role: "Product Manager",
    tag: "Product",
    avatarInitial: "C",
  },
  {
    quote:
      "The custom dictionary feature is essential for our proprietary APIs, microservice acronyms, and team names. Whisper recognizes them accurately every time.",
    author: "Devon Miller",
    role: "Infrastructure Lead",
    tag: "DevOps",
    avatarInitial: "D",
  },
  {
    quote:
      "Attorney-client privilege cannot survive unvetted cloud audio streaming. Murmur's local air-gapped processing is the only dictation architecture our compliance committee cleared for confidential litigation briefs.",
    author: "Sarah Lin, Esq.",
    role: "Partner, Tech IP Litigation",
    tag: "Legal",
    avatarInitial: "L",
  },
  {
    quote:
      "Conducting frontier AI research means our unreleased papers and hypotheses are sensitive IP. Running whisper.cpp on an Apple M3 Max with zero telemetry allows me to dictate notes freely.",
    author: "Mateo Alvarez",
    role: "ML Research Scientist",
    tag: "AI Research",
    avatarInitial: "A",
  },
  {
    quote:
      "Clinical therapy notes require absolute patient confidentiality. Knowing voice audio stays exclusively in RAM and vanishes upon paste gives me and my patients total peace of mind.",
    author: "Dr. Hannah Weiss",
    role: "Clinical Psychologist",
    tag: "Mental Health",
    avatarInitial: "H",
  },
  {
    quote:
      "Our security policy banned cloud transcription bots company-wide. Murmur passed our internal packet inspection and security audit with flying colors. 100% on-device is the future.",
    author: "Priya Nair",
    role: "VP of Engineering",
    tag: "Executive",
    avatarInitial: "P",
  },
  {
    quote:
      "Writing git commit messages, GitHub PR reviews, and technical documentation hands-free without any cloud lag has doubled my daily throughput. The shortcut is second nature now.",
    author: "Liam O'Connor",
    role: "Senior Full-Stack Engineer",
    tag: "Engineering",
    avatarInitial: "O",
  },
  {
    quote:
      "Sub-180ms latency on Windows with an RTX 4080. It's the only dictation software that keeps pace with rapid market analysis and real-time trading journal entries without stutters.",
    author: "Alexander Chen",
    role: "Quantitative Trader",
    tag: "Finance",
    avatarInitial: "X",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-800">
              Verified Community Feedback
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Trusted by engineers, clinicians, and writers.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Practical feedback from professionals who rely on on-device speech recognition daily.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08)] flex flex-col justify-between transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold">
                    {t.tag}
                  </span>
                  <MessageSquareQuote className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-6 font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200/80 flex items-center justify-center font-bold text-xs text-neutral-900">
                  {t.avatarInitial}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-950 flex items-center gap-1.5">
                    <span>{t.author}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h3>
                  <p className="text-[11px] text-neutral-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
