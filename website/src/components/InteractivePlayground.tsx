/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Mic, Copy, Check, Volume2, Cpu, Activity } from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  category: string;
  rawSpoken: string;
  fillerWords: string[];
  cleanTranscription: string;
  smartFormatted: string;
  latency: number;
  wordCount: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: "tech",
    title: "Backend Refactor Note",
    category: "Coding & Architecture",
    rawSpoken:
      "we need to refactor the payment gateway to use exponential backoff with jitter and add an idempotent key to prevent double charging on stripe webhooks",
    fillerWords: ["um", "like"],
    cleanTranscription:
      "We need to refactor the payment gateway to use exponential backoff with jitter and add an idempotent key to prevent double charging on Stripe webhooks.",
    smartFormatted: `// Architecture Decision: Payment Gateway Resiliency
1. Implement exponential backoff with Full Jitter algorithm
2. Enforce Idempotency-Key headers on all Stripe webhook handlers
3. Guarantee zero duplicate billing during network timeouts`,
    latency: 184,
    wordCount: 29,
  },
  {
    id: "standup",
    title: "Daily Standup Update",
    category: "Team Chat & Slack",
    rawSpoken:
      "yesterday I finished the directml windows integration and today I am going to write tests for the audio resampler no blockers on my end",
    fillerWords: ["uh", "guys"],
    cleanTranscription:
      "Yesterday I finished the DirectML Windows integration, and today I am going to write tests for the audio resampler. No blockers on my end.",
    smartFormatted: `Daily Standup Update:
• Yesterday: Completed DirectML Windows GPU integration
• Today: Writing unit tests for the Rubato audio resampler
• Blockers: None`,
    latency: 162,
    wordCount: 27,
  },
  {
    id: "medical",
    title: "Clinical & Technical Note",
    category: "Medical Jargon",
    rawSpoken:
      "patient presents with acute benign paroxysmal positional vertigo recommend epley maneuver and vestibular rehabilitation therapy discontinue meclizine",
    fillerWords: [],
    cleanTranscription:
      "Patient presents with acute benign paroxysmal positional vertigo. Recommend Epley maneuver and vestibular rehabilitation therapy. Discontinue meclizine.",
    smartFormatted: `DIAGNOSIS: Acute Benign Paroxysmal Positional Vertigo (BPPV)
PLAN:
1. Perform in-office Epley canalith repositioning maneuver
2. Referral to Vestibular Rehabilitation Therapy (VRT)
3. Discontinue Meclizine`,
    latency: 208,
    wordCount: 19,
  },
  {
    id: "strategy",
    title: "Q4 Roadmap Strategy",
    category: "Product & Docs",
    rawSpoken:
      "our main focus for q four is shipping the local whisper turbo model cutting battery drain on macos and releasing the enterprise offline installer",
    fillerWords: ["um"],
    cleanTranscription:
      "Our main focus for Q4 is shipping the local Whisper Turbo model, cutting battery drain on macOS, and releasing the enterprise offline installer.",
    smartFormatted: `### Q4 Strategic Priorities

• Whisper Large Turbo: Faster decode speeds with sub-200ms latency
• Zero Battery Drain: Asynchronous Metal and DirectML inference optimizations
• Enterprise Offline Installer: Air-gapped MSIX and PKG packages for regulated teams`,
    latency: 174,
    wordCount: 23,
  },
];

const TELEMETRY = [
  { label: "Processing latency", getValue: (s: Scenario) => `${s.latency} ms`, accent: false },
  { label: "Cloud egress", getValue: () => "0 bytes", accent: true },
  { label: "VRAM footprint", getValue: () => "~380 MB", accent: false },
  { label: "Software cost", getValue: () => "Free (MIT)", accent: true },
];

export function InteractivePlayground() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"clean" | "formatted">("formatted");
  const [displayedText, setDisplayedText] = useState(SCENARIOS[0].smartFormatted);
  const [isCopied, setIsCopied] = useState(false);
  const [isLiveMic, setIsLiveMic] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [audioLevels, setAudioLevels] = useState<number[]>([12, 28, 45, 80, 50, 30, 15, 60, 40, 20]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying || isLiveMic) {
      interval = setInterval(() => {
        setAudioLevels(
          Array.from({ length: 16 }, () => Math.floor(Math.random() * 55) + 12)
        );
      }, 80);
    } else {
      setAudioLevels([10, 14, 18, 22, 18, 14, 10, 14, 18, 14, 10, 14, 16, 12, 14, 10]);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isLiveMic]);

  const handleScenarioSelect = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setIsLiveMic(false);
    setIsPlaying(true);
    setDisplayedText("");

    const targetText = mode === "formatted" ? scenario.smartFormatted : scenario.cleanTranscription;
    let i = 0;
    const interval = setInterval(() => {
      if (i < targetText.length) {
        setDisplayedText(targetText.slice(0, i + 1));
        i += 2;
      } else {
        clearInterval(interval);
        setDisplayedText(targetText);
        setIsPlaying(false);
      }
    }, 12);
  };

  const toggleLiveMic = () => {
    if (isLiveMic) {
      setIsLiveMic(false);
      return;
    }

    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      try {
        // @ts-expect-error WebkitSpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsLiveMic(true);
          setLiveTranscript("Listening to your voice... Speak now.");
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setLiveTranscript(current);
        };

        recognition.onerror = () => {
          setIsLiveMic(false);
        };

        recognition.onend = () => {
          setIsLiveMic(false);
        };

        recognition.start();
      } catch {
        simulateMicFallback();
      }
    } else {
      simulateMicFallback();
    }
  };

  const simulateMicFallback = () => {
    setIsLiveMic(true);
    setLiveTranscript("Simulating microphone audio capture...");
    setTimeout(() => {
      setLiveTranscript("Murmur transcribed: Local speech recognition is fast, private, and powerful.");
      setIsLiveMic(false);
    }, 3000);
  };

  const handleCopy = () => {
    const textToCopy = isLiveMic ? liveTranscript : displayedText;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="playground" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Activity className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-neutral-300">Interactive lab</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Test Murmur in your browser.
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg">
            Experience how Murmur turns unstructured messy speech into formatted writing while stripping filler words with zero cloud latency.
          </p>
        </div>

        {/* Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Preset Scenarios (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-[#0e0e11]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-white">Select a scenario</span>
                <span className="text-[11px] font-mono text-neutral-500">Instant decode</span>
              </div>

              <div className="flex flex-col gap-2">
                {SCENARIOS.map((scenario) => {
                  const isSelected = activeScenario.id === scenario.id && !isLiveMic;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioSelect(scenario)}
                      aria-pressed={isSelected}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                        isSelected
                          ? "bg-white/[0.08] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)] text-white"
                          : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-200">
                          {scenario.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {scenario.latency}ms
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate font-mono">
                        {scenario.rawSpoken}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Real Mic Trigger */}
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={toggleLiveMic}
                  aria-pressed={isLiveMic}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                    isLiveMic
                      ? "bg-emerald-400 text-black font-bold shadow-[0_0_20px_#10b981]"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 border border-white/[0.08]"
                  }`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isLiveMic ? "text-black motion-safe:animate-pulse" : "text-emerald-400"}`} />
                  <span>{isLiveMic ? "Stop microphone" : "Test live with microphone"}</span>
                </button>
              </div>
            </div>

            {/* Telemetry Stats — one panel with internal dividers, not four repeated cards */}
            <div className="p-5 rounded-2xl bg-[#0e0e11]/80 backdrop-blur-xl border border-white/[0.08]">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-neutral-300">Local system telemetry</span>
              </div>
              <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden bg-white/[0.06] border border-white/[0.06]">
                {TELEMETRY.map(({ label, getValue, accent }) => (
                  <div key={label} className="p-3 bg-[#0e0e11]">
                    <span className="text-neutral-500 block text-[10px] font-mono">{label}</span>
                    <span className={`font-bold text-sm ${accent ? "text-emerald-400" : "text-white"}`}>
                      {getValue(activeScenario)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Output Viewer (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isLiveMic ? "Live audio stream" : activeScenario.title}
                  </h3>
                  <span className="text-xs font-mono text-neutral-500">
                    {isLiveMic ? "In-browser speech recognition" : activeScenario.category}
                  </span>
                </div>

                {!isLiveMic && (
                  <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.08]">
                    <button
                      onClick={() => {
                        setMode("clean");
                        setDisplayedText(activeScenario.cleanTranscription);
                      }}
                      className={`text-xs px-3 py-1 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                        mode === "clean" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Clean text
                    </button>
                    <button
                      onClick={() => {
                        setMode("formatted");
                        setDisplayedText(activeScenario.smartFormatted);
                      }}
                      className={`text-xs px-3 py-1 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                        mode === "formatted" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Smart format
                    </button>
                  </div>
                )}
              </div>

              {/* Sound Wave Bars */}
              <div className="my-4 p-3.5 rounded-xl bg-[#060608] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1 h-6">
                  {audioLevels.map((lvl, idx) => (
                    <span
                      key={idx}
                      className="w-1 rounded-full bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all duration-75"
                      style={{ height: `${Math.max(4, lvl / 2)}px` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
                  GPU-accelerated voice detection
                </span>
              </div>

              {/* Raw Spoken Voice */}
              {!isLiveMic && (
                <div className="mb-3.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs font-semibold text-emerald-400 block mb-1">
                    What you said
                  </span>
                  <p className="text-xs text-neutral-300 font-mono leading-relaxed">
                    &ldquo;{activeScenario.rawSpoken}&rdquo;
                  </p>
                </div>
              )}

              {/* Output Box */}
              <div className="p-5 rounded-xl bg-[#060608] border border-white/[0.08] font-mono text-xs sm:text-sm text-neutral-100 min-h-[180px] whitespace-pre-wrap leading-relaxed shadow-inner">
                {isLiveMic ? liveTranscript : displayedText}
                {isPlaying && (
                  <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 motion-safe:animate-pulse shadow-[0_0_8px_#10b981]" />
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-500">
                Pasted directly into active cursor position
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}