"use client";

import { useEffect, useRef, useState } from "react";

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
    <section className="py-28 md:py-36 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 mb-6">
          The Core Philosophy
        </span>

        {/* Capped at max width 680px per B5 / B11 */}
        <div ref={containerRef} className="max-w-[680px] mx-auto">
          <p className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight flex flex-wrap justify-center gap-x-2.5 gap-y-1">
            {TAGLINE_WORDS.map((word, idx) => {
              const isActive = idx <= activeWordsCount;
              return (
                <span
                  key={idx}
                  className={`inline-block transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isActive ? "text-white opacity-100" : "text-white/30 opacity-30"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>

        <p className="mt-8 text-sm text-white/60 max-w-[480px]">
          Whisper AI inference runs on your own hardware with zero subscriptions, zero accounts, and complete offline privacy.
        </p>
      </div>
    </section>
  );
}
