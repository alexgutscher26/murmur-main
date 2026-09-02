"use client";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  tag: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Murmur completely replaced cloud dictation tools for my daily engineering work. I write code comments, PR reviews, and Slack messages with my voice. Being 100% offline and free is an incredible achievement.",
    author: "Elena Rostova",
    role: "Staff Software Engineer",
    tag: "Engineering",
  },
  {
    quote:
      "As a physician, HIPAA compliance is strictly non negotiable. I cannot use cloud speech tools. Murmur runs locally on my laptop with zero network traffic and recognizes medical terminology reliably.",
    author: "Dr. Julian Vance",
    role: "Clinical Neurologist",
    tag: "Healthcare",
  },
  {
    quote:
      "I dictated over 40,000 words of my latest manuscript with Murmur. The filler word removal cleans false starts without interrupting my natural drafting rhythm.",
    author: "Marcus Sterling",
    role: "Author and Essayist",
    tag: "Writing",
  },
  {
    quote:
      "Alt Space on Windows with DirectML is instantaneous. The real time factor is under 0.20x. My wrist typing strain has completely disappeared.",
    author: "Siddharth Patel",
    role: "Lead Architect",
    tag: "Architecture",
  },
  {
    quote:
      "Murmur is faster than paid cloud alternatives because it eliminates the network latency roundtrip entirely. Solid native engineering.",
    author: "Chloe Dubois",
    role: "Product Manager",
    tag: "Product",
  },
  {
    quote:
      "The custom dictionary feature is essential for our proprietary APIs, microservice acronyms, and team names. Whisper recognizes them accurately every time.",
    author: "Devon Miller",
    role: "Infrastructure Lead",
    tag: "DevOps",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
            Verified Community Feedback
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Trusted by engineers, clinicians, and writers.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Practical feedback from professionals who rely on on device speech recognition daily.
          </p>
        </div>

        {/* Testimonial Cards Grid (B3: Nested radius) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#181818] border border-[#313131] flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1f1f1f] border border-[#313131] text-white/60 mb-3 inline-block">
                  {t.tag}
                </span>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6 font-normal">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-[#313131]">
                <h3 className="text-xs font-bold text-white">{t.author}</h3>
                <p className="text-[11px] text-white/50">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
