/**
 * SOURCE OF TRUTH KEYWORDS: useWordCount, estimatedWords, speaking_rate,
 *   voiced_ms, real_time_word_count, audioLevelChanged
 * WHAT:  Tracks voice activity frames during live recording and computes a
 *        real-time estimated word count for display in the pill.
 * WHY:   Whisper processes chunks in 8-15s windows, so decoded text only arrives
 *        periodically. Tracking voiced audio frames in real time with an average
 *        speaking rate baseline (~140 WPM) provides instant feedback ("~12 words")
 *        while speaking, keeping latency at zero.
 * WHERE: Mounted in src/app/pill/Pill.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { events } from "@/lib/bindings";
import { useTauriEvent } from "@/lib/use-event";

/** Average conversational speech rate in words per millisecond (140 WPM). */
const DEFAULT_WORDS_PER_MS = 140 / 60_000;
/** RMS amplitude threshold to classify an audio frame as voiced speech. */
const SPEECH_VOICE_THRESHOLD = 0.018;

export interface WordCountResult {
  estimatedWords: number;
  formatted: string;
}

export function useWordCount(live: boolean): WordCountResult {
  const [estimatedWords, setEstimatedWords] = useState(0);
  const voicedMsRef = useRef(0);
  const lastSampleTimeRef = useRef<number | null>(null);

  // Reset when recording ends or starts fresh
  useEffect(() => {
    if (!live) {
      voicedMsRef.current = 0;
      lastSampleTimeRef.current = null;
      setEstimatedWords(0);
    }
  }, [live]);

  useTauriEvent(events.audioLevelChanged, (payload) => {
    if (!live) return;
    const now = performance.now();
    const dt = lastSampleTimeRef.current !== null ? Math.min(now - lastSampleTimeRef.current, 200) : 50;
    lastSampleTimeRef.current = now;

    const rms = payload.level.rms ?? payload.level.peak ?? 0;
    if (rms >= SPEECH_VOICE_THRESHOLD) {
      voicedMsRef.current += dt;
      const count = Math.max(0, Math.floor(voicedMsRef.current * DEFAULT_WORDS_PER_MS));
      setEstimatedWords((prev) => (count !== prev ? count : prev));
    }
  });

  const formatted =
    estimatedWords > 0
      ? `~${estimatedWords} ${estimatedWords === 1 ? "word" : "words"}`
      : "";

  return {
    estimatedWords,
    formatted,
  };
}
