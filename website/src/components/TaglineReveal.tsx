"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, ShieldCheck, Zap, Sparkles } from "lucide-react";

const TAGLINE_WORDS = [
  "Your", "voice", "is", "your", "fastest", "tool.",
  "Turn", "unfiltered", "thoughts", "into", "pristine", "writing,",
  "code,", "and", "decisions", "without", "touching", "the", "cloud."
];

const PHILOSOPHY_PILLARS = [
  {
    icon: Cpu,
    title: "100% On-Device Compute",
    description:
      "All acoustic feature extraction and token decoding run directly in local GPU/Neural Engine memory. No cloud roundtrips, no API keys, and no rate limits.",
    badge: "whisper.cpp engine",
  },
  {
    icon: ShieldCheck,
    title: "Zero Telemetry or Audio Logs",
    description:
      "Your microphone audio never touches a remote server. Verified by packet inspection tools like Wireshark and LuLu. 0 bytes outbound network egress.",
    badge: "Air-gap verified",
  },
  {
    icon: Zap,
    title: "Universal OS Injection",
    description:
      "Dictate into Cursor, Slack, Notion, Xcode, or Terminal at the OS level. Murmur simulates native key events directly without overwriting your clipboard history.",
    badge: "Sub-180ms latency",
  },
];

export function TaglineReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeWordsCount, setActiveWordsCount] = useState<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Compute scroll progress from when element enters lower third to middle
          const start = windowHeight * 0.85;
          const end = windowHeight * 0.35;
          const current = rect.top;

          let progress = (start - current) / (start - end);
          progress = Math.max(0, Math.min(1, progress));

          const wordsToActivate = Math.floor(progress * TAGLINE_WORDS.length);
          setActiveWordsCount(wordsToActivate);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="py-24 md:py-36 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center text-center relative z-10">
        {/* Top Eyebrow Pill Badge matching Hero */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-8 transition-transform hover:scale-[1.02] cursor-default">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono font-medium text-neutral-800">
            The Core Philosophy
          </span>
        </div>

        {/* Scroll Reveal Tagline */}
        <div ref={containerRef} className="max-w-4xl mx-auto">
          <p className="text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.15] tracking-[-0.035em] flex flex-wrap justify-center gap-x-3.5 gap-y-2">
            {TAGLINE_WORDS.map((word, idx) => {
              const isActive = idx <= activeWordsCount;
              const isCloudHighlight = word.toLowerCase().includes("cloud") || word.toLowerCase().includes("touching");
              return (
                <span
                  key={idx}
                  className={`inline-block transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? isCloudHighlight
                        ? "text-neutral-950 font-bold opacity-100 scale-100 underline decoration-emerald-500/40 decoration-wavy underline-offset-8"
                        : "text-neutral-950 font-bold opacity-100 scale-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      : "text-neutral-300 opacity-40 scale-[0.98]"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>

        <p className="mt-8 text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed font-normal">
          Whisper AI inference runs directly on your Apple Silicon Neural Engine or Windows DirectML GPU with zero cloud subscriptions, zero telemetry, and complete offline privacy.
        </p>

        {/* 3 Philosophy Pillars matching the Hero's card style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 text-left w-full">
          {PHILOSOPHY_PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white hover:bg-neutral-50/70 border border-neutral-200/90 hover:border-neutral-300 shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/80 group-hover:bg-[#141416] group-hover:border-[#141416] group-hover:text-white flex items-center justify-center text-neutral-700 transition-all duration-200 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/80 font-medium">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 group-hover:text-black mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
