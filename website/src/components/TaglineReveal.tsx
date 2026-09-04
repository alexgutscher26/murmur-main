"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

const TAGLINE_WORDS = [
  "Your", "voice", "is", "your", "fastest", "tool.",
  "Turn", "unfiltered", "thoughts", "into", "pristine", "writing,",
  "code,", "and", "decisions", "without", "touching", "the", "cloud."
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
    <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/[0.06]">
      <div className="ambient-glow-emerald top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />

      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
            The Core Philosophy
          </span>
        </div>

        <div ref={containerRef} className="max-w-3xl mx-auto">
          <p className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.18] tracking-tight flex flex-wrap justify-center gap-x-3 gap-y-1.5">
            {TAGLINE_WORDS.map((word, idx) => {
              const isActive = idx <= activeWordsCount;
              return (
                <span
                  key={idx}
                  className={`inline-block transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "text-white opacity-100 scale-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "text-zinc-600 opacity-30 scale-[0.98]"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>

        <p className="mt-8 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
          Whisper AI inference runs directly on your Apple Silicon Neural Engine or NVIDIA/AMD GPU with zero cloud subscriptions, zero telemetry, and complete offline privacy.
        </p>
      </div>
    </section>
  );
}
