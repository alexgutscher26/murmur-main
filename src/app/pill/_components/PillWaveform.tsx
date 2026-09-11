/**
 * SOURCE OF TRUTH KEYWORDS: PillWaveform, audioLevelChanged, 5-bar audio visualizer
 * WHAT:  Subscribes to audio-level-changed and animates the 5-bar white audio visualizer
 *        directly on the DOM for zero React re-render overhead.
 * WHERE: The pill's RECORDING / ARMING state.
 */

import { useRef } from "react";
import { events } from "@/lib/bindings";
import { useTauriEvent } from "@/lib/use-event";
import { cn } from "@/lib/utils";

const BASE_HEIGHTS = [4, 11, 18, 11, 4];
const MAX_HEIGHTS = [8, 18, 24, 18, 8];

export function PillWaveform({ className }: { className?: string }) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useTauriEvent(events.audioLevelChanged, (payload) => {
    const rms = payload.level.rms ?? payload.level.peak ?? 0;
    const ratio = Math.min(1, Math.max(0, rms / 0.28));
    const smoothed = Math.pow(ratio, 0.65);

    for (let i = 0; i < 5; i++) {
      const el = barsRef.current[i];
      if (!el) continue;
      const base = BASE_HEIGHTS[i];
      const max = MAX_HEIGHTS[i];
      const h = base + (max - base) * smoothed;
      el.style.height = `${h.toFixed(1)}px`;
    }
  });

  return (
    <div
      className={cn("flex items-center gap-[2.5px] h-[24px] shrink-0", className)}
      aria-hidden="true"
    >
      {BASE_HEIGHTS.map((h, i) => (
        <span
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="w-[3px] rounded-full bg-white transition-[height] duration-75 ease-out"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}
