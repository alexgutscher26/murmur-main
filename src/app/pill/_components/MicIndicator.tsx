/**
 * SOURCE OF TRUTH KEYWORDS: MicIndicator, StateDot, audioLevelChanged,
 *   PillTone, AudioLevel, reactive-mic, soundwave-pulse
 * WHAT:  The pill's status indicator — an SVG microphone with soundwave arcs
 *        that react in real time to live audio levels during recording.
 * WHY:   ZERO-REACT-RERENDER CONTRACT. The audio level events fire at high
 *        frequency (several times a second) from the microphone stream.
 *        Updating soundwave scale and opacity imperatively via DOM refs ensures
 *        zero React component re-renders and preserves the 60fps pill budget.
 *        Follows the design tokens from docs/04 §7 for tones (ink / danger).
 * WHERE: The left slot of the pill (src/app/pill/Pill.tsx), replacing the static dot.
 */

import { useEffect, useRef } from "react";
import { events } from "@/lib/bindings";
import { useTauriEvent } from "@/lib/use-event";
import { readNumberToken } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { PillTone } from "./StateDot";

export interface MicIndicatorProps {
  tone: PillTone;
  recording?: boolean;
  className?: string;
}

export function MicIndicator({ tone, recording = false, className }: MicIndicatorProps) {
  const waveLeftRef = useRef<SVGPathElement>(null);
  const waveRightRef = useRef<SVGPathElement>(null);
  const coreMicRef = useRef<SVGSVGElement>(null);

  // Curve scaling constants read once to protect frame budget
  const curveRef = useRef({ ceiling: 0.25, gamma: 0.7 });

  useEffect(() => {
    curveRef.current = {
      ceiling: readNumberToken("--waveform-input-ceiling") || 0.25,
      gamma: readNumberToken("--waveform-input-gamma") || 0.7,
    };
  }, []);

  useTauriEvent(events.audioLevelChanged, (payload) => {
    if (!recording) return;
    const rms = payload.level.rms ?? payload.level.peak ?? 0;
    const ratio = Math.min(1, Math.max(0, rms / curveRef.current.ceiling));
    const intensity = Math.pow(ratio, curveRef.current.gamma);

    // Audio-reactive scale and opacity adjustments
    if (waveLeftRef.current && waveRightRef.current) {
      const scale = 1 + intensity * 0.45;
      const opacity = 0.35 + intensity * 0.65;
      waveLeftRef.current.style.transform = `scale(${scale})`;
      waveLeftRef.current.style.opacity = `${opacity}`;
      waveRightRef.current.style.transform = `scale(${scale})`;
      waveRightRef.current.style.opacity = `${opacity}`;
    }

    if (coreMicRef.current) {
      const coreScale = 1 + intensity * 0.15;
      coreMicRef.current.style.transform = `scale(${coreScale})`;
    }
  });

  const isDanger = tone === "danger";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex size-4 shrink-0 items-center justify-center transition-colors",
        isDanger ? "text-danger" : "text-text-primary",
        className,
      )}
    >
      <svg
        ref={coreMicRef}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-3.5 origin-center transition-transform duration-75 ease-out"
      >
        {/* Core Microphone Body */}
        <rect
          x="6"
          y="2"
          width="4"
          height="7"
          rx="2"
          fill="currentColor"
        />
        {/* Mic Base Cradle */}
        <path
          d="M4 6.5C4 8.70914 5.79086 10.5 8 10.5C10.2091 10.5 12 8.70914 12 6.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {/* Mic Stem */}
        <path
          d="M8 10.5V13"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {/* Left Audio-Reactive Soundwave Arc */}
        {recording && (
          <path
            ref={waveLeftRef}
            d="M2.5 5C2.18 5.9 2 6.9 2 8C2 9.1 2.18 10.1 2.5 11"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="origin-center opacity-40 transition-all duration-75"
          />
        )}
        {/* Right Audio-Reactive Soundwave Arc */}
        {recording && (
          <path
            ref={waveRightRef}
            d="M13.5 5C13.82 5.9 14 6.9 14 8C14 9.1 13.82 10.1 13.5 11"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="origin-center opacity-40 transition-all duration-75"
          />
        )}
      </svg>
    </div>
  );
}
