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
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Verified Community Feedback
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Trusted by engineers, clinicians, and writers.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Practical feedback from professionals who rely on on-device speech recognition daily.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.16] flex flex-col justify-between transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-emerald-400 font-semibold">
                    {t.tag}
                  </span>
                  <MessageSquareQuote className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-bold text-xs text-white">
                  {t.avatarInitial}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{t.author}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </h3>
                  <p className="text-[11px] text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
