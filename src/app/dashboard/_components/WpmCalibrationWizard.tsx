/**
 * SOURCE OF TRUTH KEYWORDS: WpmCalibrationWizard, calibrateWpm, BASELINE_WPM,
 *   ReadingCalibration, TypingCalibration, SpeedupMultiplier
 * WHAT:  Calibration wizard measuring actual speech rate and typing speed.
 * WHY:   general.baseline_wpm powers the "Time saved" metric across Stats and
 *        the Dashboard. Asking the user to guess their typing speed leads to
 *        inaccurate stats; walking them through a reading passage or typing test
 *        measures real speed empirically with zero guesswork.
 * WHERE: Opened from SettingsView and StatsView. Updates general.baseline_wpm.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Mic, Play, RotateCcw, Sparkles, Timer, Type, X } from "lucide-react";
import { commands, type AppError } from "@/lib/bindings";
import { unwrapCommand } from "@/lib/ipc";
import { cn } from "@/lib/utils";
import { GlassPanel, SegmentedControl, type SegmentOption } from "@/components/global";

const PASSAGE =
  "Speech recognition allows us to communicate naturally with our computers. By dictating thoughts directly as they come to mind, we write messages, draft documents, and take notes much faster than typing on a keyboard.";

const PASSAGE_WORDS = PASSAGE.split(/\s+/).length;

const BASELINE_WPM_KEY = "general.baseline_wpm";

type CalibrationTab = "reading" | "typing";

const TAB_OPTIONS: readonly SegmentOption<CalibrationTab>[] = [
  { value: "reading", label: "Speech pace" },
  { value: "typing", label: "Typing test" },
];

export interface WpmCalibrationWizardProps {
  currentBaselineWpm?: number;
  onClose: () => void;
  onSaved?: (newWpm: number) => void;
}

export function WpmCalibrationWizard({
  currentBaselineWpm = 40,
  onClose,
  onSaved,
}: WpmCalibrationWizardProps) {
  const [tab, setTab] = useState<CalibrationTab>("reading");
  const [targetWpm, setTargetWpm] = useState<number>(currentBaselineWpm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Reading Mode State
  const [readingState, setReadingState] = useState<"idle" | "running" | "done">("idle");
  const [readElapsedMs, setReadElapsedMs] = useState(0);
  const [measuredSpeakingWpm, setMeasuredSpeakingWpm] = useState<number | null>(null);
  const readStartRef = useRef<number>(0);
  const readTimerRef = useRef<number>(0);

  // Typing Mode State
  const [typingInput, setTypingInput] = useState("");
  const [typingState, setTypingState] = useState<"idle" | "running" | "done">("idle");
  const [typeElapsedMs, setTypeElapsedMs] = useState(0);
  const [measuredTypingWpm, setMeasuredTypingWpm] = useState<number | null>(null);
  const typeStartRef = useRef<number>(0);
  const typeTimerRef = useRef<number>(0);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      window.clearInterval(readTimerRef.current);
      window.clearInterval(typeTimerRef.current);
    };
  }, []);

  // ── Reading mode handlers ──────────────────────────────────────────────

  const startReading = useCallback(() => {
    setReadingState("running");
    setReadElapsedMs(0);
    readStartRef.current = performance.now();
    window.clearInterval(readTimerRef.current);
    readTimerRef.current = window.setInterval(() => {
      setReadElapsedMs(performance.now() - readStartRef.current);
    }, 100);
  }, []);

  const finishReading = useCallback(() => {
    window.clearInterval(readTimerRef.current);
    const elapsedSeconds = (performance.now() - readStartRef.current) / 1000;
    const finalSeconds = Math.max(1, elapsedSeconds);
    const calculatedWpm = Math.round(PASSAGE_WORDS / (finalSeconds / 60));
    setMeasuredSpeakingWpm(calculatedWpm);
    setReadingState("done");

    // Standard average typing speed is ~28% of speech rate if user hasn't typed yet
    const estimatedTyping = Math.max(15, Math.min(120, Math.round(calculatedWpm * 0.28)));
    setTargetWpm(estimatedTyping);
  }, []);

  const resetReading = useCallback(() => {
    window.clearInterval(readTimerRef.current);
    setReadingState("idle");
    setReadElapsedMs(0);
  }, []);

  // ── Typing test handlers ───────────────────────────────────────────────

  const handleTypingChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = event.target.value;
      if (typingState === "idle" && val.length > 0) {
        setTypingState("running");
        typeStartRef.current = performance.now();
        window.clearInterval(typeTimerRef.current);
        typeTimerRef.current = window.setInterval(() => {
          setTypeElapsedMs(performance.now() - typeStartRef.current);
        }, 100);
      }

      setTypingInput(val);

      // Check if finished typing the full passage
      if (val.trim().length >= PASSAGE.trim().length) {
        window.clearInterval(typeTimerRef.current);
        const elapsedSec = Math.max(1, (performance.now() - typeStartRef.current) / 1000);
        const words = val.trim().split(/\s+/).length;
        const wpm = Math.round(words / (elapsedSec / 60));
        setMeasuredTypingWpm(wpm);
        setTargetWpm(wpm);
        setTypingState("done");
      }
    },
    [typingState],
  );

  const resetTyping = useCallback(() => {
    window.clearInterval(typeTimerRef.current);
    setTypingState("idle");
    setTypingInput("");
    setTypeElapsedMs(0);
    setMeasuredTypingWpm(null);
  }, []);

  // ── Save handler ───────────────────────────────────────────────────────

  const saveBaseline = useCallback(async () => {
    setSaving(true);
    setError(null);
    const result = await unwrapCommand(() =>
      commands.setSetting({
        key: BASELINE_WPM_KEY,
        value: { type: "NUMBER", value: Math.max(10, Math.min(200, targetWpm)) },
      }),
    );
    setSaving(false);
    if (result.status === "ok") {
      setSavedSuccess(true);
      onSaved?.(targetWpm);
      window.setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setError(result.error);
    }
  }, [onClose, onSaved, targetWpm]);

  // Speedup multiplier against target typing speed
  const speedup = useMemo(() => {
    const speech = measuredSpeakingWpm ?? 150;
    const typing = targetWpm > 0 ? targetWpm : 40;
    return (speech / typing).toFixed(1);
  }, [measuredSpeakingWpm, targetWpm]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wpm-wizard-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
    >
      <GlassPanel
        material="elevated"
        radius="card"
        className="relative flex w-full max-w-[560px] flex-col gap-5 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2
              id="wpm-wizard-title"
              className="text-heading text-text-primary flex items-center gap-2"
            >
              <Sparkles className="size-4 text-text-secondary" />
              WPM Baseline Calibration
            </h2>
            <p className="text-caption text-text-secondary">
              Measure your speech and typing rate to ensure your time-saved statistics are accurate.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close wizard"
            onClick={onClose}
            className="rounded-input p-1 text-text-secondary transition-colors hover:bg-sunken hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab switch */}
        <SegmentedControl
          label="Calibration mode"
          options={TAB_OPTIONS}
          value={tab}
          onChange={setTab}
          className="w-full"
        />

        {/* Mode 1: Reading Aloud (Speech Rate) */}
        {tab === "reading" ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-input border border-hairline bg-sunken p-4">
              <p className="text-caption font-medium uppercase tracking-wider text-text-tertiary mb-1">
                Read aloud at your natural pace:
              </p>
              <p className="text-body leading-relaxed text-text-primary italic select-none">
                "{PASSAGE}"
              </p>
            </div>

            {/* Reading Timer / Action */}
            <div className="flex items-center justify-between gap-3 rounded-input bg-sunken-strong p-3">
              <div className="flex items-center gap-2">
                <Timer className="size-4 text-text-secondary" />
                <span className="font-mono text-body font-medium text-text-primary">
                  {(readElapsedMs / 1000).toFixed(1)}s
                </span>
                {readingState === "running" ? (
                  <span className="flex size-2 rounded-full bg-danger animate-pulse" />
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {readingState === "idle" ? (
                  <button
                    type="button"
                    onClick={startReading}
                    className="flex items-center gap-2 rounded-input bg-text-primary px-4 py-1.5 text-body font-medium text-opaque-elevated transition-transform active:scale-95"
                  >
                    <Play className="size-3.5 fill-current" />
                    Start reading
                  </button>
                ) : readingState === "running" ? (
                  <button
                    type="button"
                    onClick={finishReading}
                    className="flex items-center gap-2 rounded-input bg-danger px-4 py-1.5 text-body font-medium text-opaque-elevated transition-transform active:scale-95"
                  >
                    <Check className="size-3.5 strokeWidth={3}" />
                    I'm done
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetReading}
                    className="flex items-center gap-1.5 rounded-input bg-sunken px-3 py-1 text-caption text-text-secondary hover:text-text-primary"
                  >
                    <RotateCcw className="size-3" />
                    Read again
                  </button>
                )}
              </div>
            </div>

            {measuredSpeakingWpm !== null ? (
              <div className="flex items-center justify-between rounded-input border border-hairline bg-sunken p-3 text-caption text-text-secondary">
                <span className="flex items-center gap-2">
                  <Mic className="size-4 text-text-primary" />
                  <span>Measured speaking speed:</span>
                </span>
                <span className="font-mono text-body font-semibold text-text-primary">
                  {measuredSpeakingWpm} WPM
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          /* Mode 2: Typing Speed Test */
          <div className="flex flex-col gap-4">
            <div className="rounded-input border border-hairline bg-sunken p-4">
              <p className="text-caption font-medium uppercase tracking-wider text-text-tertiary mb-1">
                Type the passage below:
              </p>
              <p className="text-body leading-relaxed text-text-secondary select-none mb-3">
                {PASSAGE}
              </p>

              <textarea
                value={typingInput}
                onChange={handleTypingChange}
                disabled={typingState === "done"}
                placeholder="Start typing here to begin the test..."
                rows={3}
                className="w-full resize-none rounded-input border border-hairline bg-surface-opaque-elevated p-2.5 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-text-secondary"
              />
            </div>

            {/* Typing status bar */}
            <div className="flex items-center justify-between gap-3 rounded-input bg-sunken-strong p-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-mono text-caption text-text-secondary">
                  <Type className="size-3.5" />
                  {typingInput.trim().split(/\s+/).filter(Boolean).length} / {PASSAGE_WORDS} words
                </span>
                <span className="font-mono text-body font-medium text-text-primary">
                  {(typeElapsedMs / 1000).toFixed(1)}s
                </span>
              </div>

              {typingState === "done" ? (
                <button
                  type="button"
                  onClick={resetTyping}
                  className="flex items-center gap-1.5 rounded-input bg-sunken px-3 py-1 text-caption text-text-secondary hover:text-text-primary"
                >
                  <RotateCcw className="size-3" />
                  Retry test
                </button>
              ) : null}
            </div>

            {measuredTypingWpm !== null ? (
              <div className="flex items-center justify-between rounded-input border border-hairline bg-sunken p-3 text-caption text-text-secondary">
                <span>Measured typing speed:</span>
                <span className="font-mono text-body font-semibold text-text-primary">
                  {measuredTypingWpm} WPM
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Speedup and calibration baseline summary */}
        <div className="flex flex-col gap-3 rounded-input border border-hairline bg-sunken p-4">
          <div className="flex items-center justify-between">
            <span className="text-body text-text-primary">Your typing baseline:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={200}
                step={1}
                value={targetWpm}
                onChange={(e) => setTargetWpm(Number(e.target.value))}
                className="w-20 rounded-input border border-hairline bg-surface-opaque-elevated px-2 py-1 text-center font-mono text-body font-semibold text-text-primary"
              />
              <span className="text-caption text-text-secondary">WPM</span>
            </div>
          </div>

          <p className="text-caption text-text-secondary">
            Speaking ({measuredSpeakingWpm ?? 150} WPM) is approximately{" "}
            <strong className="text-text-primary font-semibold">{speedup}× faster</strong> than
            typing at {targetWpm} WPM.
          </p>
        </div>

        {error ? <p className="text-caption text-danger">{error.message}</p> : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 hairline-t">
          <button
            type="button"
            onClick={onClose}
            className="rounded-input px-3 py-1.5 text-body text-text-secondary transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || savedSuccess}
            onClick={saveBaseline}
            className={cn(
              "flex items-center gap-2 rounded-input px-4 py-1.5 text-body font-medium transition-all",
              savedSuccess
                ? "bg-text-primary text-opaque-elevated"
                : "bg-text-primary text-opaque-elevated hover:opacity-90 active:scale-95 disabled:opacity-50",
            )}
          >
            {savedSuccess ? (
              <>
                <Check className="size-4 strokeWidth={3}" />
                Saved
              </>
            ) : saving ? (
              "Saving…"
            ) : (
              "Save typing baseline"
            )}
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}
