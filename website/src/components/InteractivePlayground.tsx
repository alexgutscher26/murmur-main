"use client";

import { useState, useEffect } from "react";

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
    category: "Coding and Architecture",
    rawSpoken:
      "we need to refactor the payment gateway to use exponential backoff with jitter and add an idempotent key to prevent double charging on stripe webhooks",
    fillerWords: ["um", "like"],
    cleanTranscription:
      "We need to refactor the payment gateway to use exponential backoff with jitter and add an idempotent key to prevent double charging on Stripe webhooks.",
    smartFormatted: `// Architecture Decision: Payment Gateway Resiliency
1. Implement exponential backoff with Full Jitter algorithm
2. Enforce Idempotency Key headers on all Stripe webhook handlers
3. Guarantee zero duplicate billing during network timeouts`,
    latency: 184,
    wordCount: 29,
  },
  {
    id: "standup",
    title: "Daily Standup Update",
    category: "Team Chat and Slack",
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
    title: "Clinical and Technical Note",
    category: "Medical and Technical Jargon",
    rawSpoken:
      "patient presents with acute benign paroxysmal positional vertigo recommend epley maneuver and vestibular rehabilitation therapy discontinue meclizine",
    fillerWords: [],
    cleanTranscription:
      "Patient presents with acute benign paroxysmal positional vertigo. Recommend Epley maneuver and vestibular rehabilitation therapy. Discontinue meclizine.",
    smartFormatted: `DIAGNOSIS: Acute Benign Paroxysmal Positional Vertigo (BPPV)
PLAN:
1. Perform in office Epley canalith repositioning maneuver
2. Referral to Vestibular Rehabilitation Therapy (VRT)
3. Discontinue Meclizine`,
    latency: 208,
    wordCount: 19,
  },
  {
    id: "strategy",
    title: "Q4 Roadmap Strategy",
    category: "Product and Docs",
    rawSpoken:
      "our main focus for q four is shipping the local whisper turbo model cutting battery drain on macos and releasing the enterprise offline installer",
    fillerWords: ["um"],
    cleanTranscription:
      "Our main focus for Q4 is shipping the local Whisper Turbo model, cutting battery drain on macOS, and releasing the enterprise offline installer.",
    smartFormatted: `### Q4 Strategic Priorities

• Whisper Large Turbo: Faster decode speeds with sub 200ms latency
• Zero Battery Drain: Asynchronous Metal and DirectML inference optimizations
• Enterprise Offline Installer: Air gapped MSIX and PKG packages for regulated teams`,
    latency: 174,
    wordCount: 23,
  },
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
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 55) + 12)
        );
      }, 90);
    } else {
      setAudioLevels([10, 14, 18, 22, 18, 14, 10, 14, 18, 14, 10, 14]);
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
    }, 15);
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
    <section id="playground" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
            Interactive Voice Laboratory
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Test Murmur in your browser.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Experience how Murmur turns speech into formatted text while removing filler words with zero cloud latency.
          </p>
        </div>

        {/* Playground Grid (B3: Nested radius) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Preset Scenarios (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#313131]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Voice Scenarios</span>
                <span className="text-xs font-mono text-white/50">Click to listen</span>
              </div>

              <div className="flex flex-col gap-2">
                {SCENARIOS.map((scenario) => {
                  const isSelected = activeScenario.id === scenario.id && !isLiveMic;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioSelect(scenario)}
                      className={`w-full p-3 rounded-lg border text-left transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isSelected
                          ? "bg-[#272727] border-white/40 text-white"
                          : "bg-[#1f1f1f] border-[#313131] text-white/70 hover:text-white hover:bg-[#272727]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          {scenario.title}
                        </span>
                        <span className="text-xs font-mono text-white/60">
                          {scenario.latency}ms
                        </span>
                      </div>
                      <p className="text-xs text-white/50 truncate mt-0.5 font-mono">
                        {scenario.rawSpoken}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Real Mic Trigger */}
              <div className="mt-4 pt-3 border-t border-[#313131]">
                <button
                  onClick={toggleLiveMic}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isLiveMic
                      ? "bg-white text-black font-bold"
                      : "bg-[#1f1f1f] hover:bg-[#272727] text-white border border-[#313131]"
                  }`}
                >
                  {isLiveMic ? "Stop microphone recording" : "Test with your microphone"}
                </button>
              </div>
            </div>

            {/* Telemetry Stats Box */}
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#313131]">
              <span className="text-xs font-mono uppercase tracking-wider text-white/50 font-semibold block mb-3">
                Local system telemetry
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                  <span className="text-white/50 block text-[10px]">Latency</span>
                  <span className="font-bold text-white text-sm">{activeScenario.latency} ms</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                  <span className="text-white/50 block text-[10px]">Cloud upload</span>
                  <span className="font-bold text-white text-sm">0 bytes</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                  <span className="text-white/50 block text-[10px]">Memory footprint</span>
                  <span className="font-bold text-white text-sm">42.8 MB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                  <span className="text-white/50 block text-[10px]">Subscription</span>
                  <span className="font-bold text-white text-sm">$0.00 free</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Output Viewer (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#181818] border border-[#313131] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#313131] flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isLiveMic ? "Live Microphone Feed" : activeScenario.title}
                  </h3>
                  <span className="text-xs font-mono text-white/50">
                    {isLiveMic ? "Streaming recognition" : activeScenario.category}
                  </span>
                </div>

                {!isLiveMic && (
                  <div className="flex items-center gap-1 bg-[#1f1f1f] p-1 rounded-lg border border-[#313131]">
                    <button
                      onClick={() => {
                        setMode("clean");
                        setDisplayedText(activeScenario.cleanTranscription);
                      }}
                      className={`text-xs px-2.5 py-1 rounded transition-colors ${
                        mode === "clean" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
                      }`}
                    >
                      Clean text
                    </button>
                    <button
                      onClick={() => {
                        setMode("formatted");
                        setDisplayedText(activeScenario.smartFormatted);
                      }}
                      className={`text-xs px-2.5 py-1 rounded transition-colors ${
                        mode === "formatted" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
                      }`}
                    >
                      Smart format
                    </button>
                  </div>
                )}
              </div>

              {/* Sound Wave Bars */}
              <div className="my-4 p-3 rounded-lg bg-[#131209] border border-[#313131] flex items-center justify-between">
                <div className="flex items-center gap-1.5 h-6">
                  {audioLevels.map((lvl, idx) => (
                    <span
                      key={idx}
                      className="w-1 rounded-full bg-white transition-all duration-75"
                      style={{ height: `${Math.max(4, lvl / 2)}px` }}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-white/60">
                  16 kHz WASAPI and CoreAudio
                </span>
              </div>

              {/* Raw Spoken Voice */}
              {!isLiveMic && (
                <div className="mb-3 p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                  <span className="text-[10px] font-mono uppercase text-white/50 block mb-0.5 font-semibold">
                    Spoken input text
                  </span>
                  <p className="text-xs text-white/70 font-mono">
                    &quot;{activeScenario.rawSpoken}&quot;
                  </p>
                </div>
              )}

              {/* Output Box */}
              <div className="p-4 rounded-lg bg-[#131209] border border-[#313131] font-mono text-xs sm:text-sm text-white/90 min-h-[160px] whitespace-pre-wrap leading-relaxed">
                {isLiveMic ? liveTranscript : displayedText}
                {isPlaying && (
                  <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-[#313131] flex items-center justify-between">
              <span className="text-xs font-mono text-white/50">
                Pasted directly into active cursor position
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-white bg-[#272727] hover:bg-[#313131] border border-[#313131] px-3 py-1.5 rounded-lg transition-colors"
              >
                {isCopied ? "Copied" : "Copy text"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
