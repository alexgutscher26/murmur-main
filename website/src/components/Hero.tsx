/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mark } from "./Mark";

interface AppPreset {
  id: string;
  name: string;
  rawSpoken: string;
  formattedOutput: string;
}

const APP_PRESETS: AppPreset[] = [
  {
    id: "cursor",
    name: "Cursor & VS Code",
    rawSpoken:
      "write an async function handlePaymentWebhook that validates stripe signatures and updates customer status in supabase",
    formattedOutput: `export async function handlePaymentWebhook(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) throw new Error("Missing signature header");

  const event = stripe.webhooks.constructEvent(
    await req.text(),
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "customer.subscription.updated") {
    await supabase.from("subscriptions").upsert({
      customer_id: event.data.object.customer,
      status: event.data.object.status,
    });
  }
  return new Response("ok", { status: 200 });
}`,
  },
  {
    id: "slack",
    name: "Slack",
    rawSpoken:
      "quick update we deployed local whisper optimization on windows real time factor dropped to zero point two please test and report bugs",
    formattedOutput: `Hey team. Quick update on dictation speed:

• Deployed local Whisper optimizations with DirectML on Windows
• Real time factor dropped to 0.20x with sub 200ms latency
• Please test your dictations and report any edge cases in eng bugs`,
  },
  {
    id: "notion",
    name: "Notion & Linear",
    rawSpoken:
      "priorities for next sprint add directml gpu inference improve custom dictionary matching release windows msix bundle",
    formattedOutput: `## Sprint Priorities and Action Items

• DirectML GPU Inference: Enable hardware acceleration for sub 100ms decodes
• Custom Dictionary Engine: Phonetic biasing for specialized team jargon
• Windows MSIX Bundle: Package signed installer for enterprise deployment`,
  },
  {
    id: "mail",
    name: "Mail & Docs",
    rawSpoken:
      "thanks for reaching out regarding our security model all speech processing runs locally on device with zero cloud telemetry",
    formattedOutput: `Hi Sarah,

Thanks for reaching out. Regarding our security model, all speech recognition and formatting runs entirely on device via local Whisper models. Zero audio or telemetry ever leaves your computer.

Let me know if you would like to schedule a technical overview.

Best regards,
Alex`,
  },
];

export function Hero() {
  const [selectedApp, setSelectedApp] = useState<AppPreset>(APP_PRESETS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [typedText, setTypedText] = useState(APP_PRESETS[0].formattedOutput);
  const [pillState, setPillState] = useState<"idle" | "listening" | "processing" | "pasted">("idle");
  const [detectedOs, setDetectedOs] = useState<"mac" | "windows" | "linux">("mac");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes("win")) setDetectedOs("windows");
      else if (userAgent.includes("mac")) setDetectedOs("mac");
      else setDetectedOs("linux");
    }
  }, []);

  const startSimulation = (preset = selectedApp) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setTypedText("");
    setPillState("listening");

    setTimeout(() => {
      setPillState("processing");
      let currentText = "";
      const target = preset.formattedOutput;
      let i = 0;
      const speed = Math.max(10, Math.floor(1600 / target.length));

      const interval = setInterval(() => {
        if (i < target.length) {
          currentText += target[i];
          setTypedText(currentText);
          i++;
        } else {
          clearInterval(interval);
          setPillState("pasted");
          setIsSimulating(false);
          setTimeout(() => {
            setPillState("idle");
          }, 3000);
        }
      }, speed);
    }, 1000);
  };

  const handleSelectApp = (preset: AppPreset) => {
    setSelectedApp(preset);
    setTypedText(preset.formattedOutput);
    setPillState("idle");
    setIsSimulating(false);
  };

  return (
    <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-[#000000] flex flex-col items-center">
      {/* Proof Badge (A2) */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-8 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-white/90">
          Local-first by architecture, not merely private by policy
        </span>
        <span className="text-xs font-mono text-white/60 pl-1 border-l border-[#313131]">
          macOS & Windows
        </span>
      </div>

      {/* Hero Headline & Subheadline (B5: Capped at 680px with meaningful breaks) */}
      <div className="text-center max-w-[680px] px-4 mx-auto">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gradient-hero mb-6">
          Private AI dictation that
          <span className="block mt-1">never leaves your computer.</span>
        </h1>
        <p className="text-base sm:text-lg text-white/80 leading-relaxed font-normal mb-8">
          Turn your voice into polished text in any app—processed locally on your PC or Mac.
          No uploaded audio. No cloud transcript history. No selling your data.
        </p>
      </div>

      {/* Primary CTA and Secondary Demo Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-10">
        <a
          href="#download"
          className="text-base font-semibold text-black bg-white hover:bg-white/90 px-6 py-3 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
        >
          Download free for {detectedOs === "mac" ? "macOS" : "Windows"}
        </a>
        <a
          href="#playground"
          className="text-base font-semibold text-white/80 hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#313131] px-5 py-3 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          Try live playground
        </a>
      </div>

      {/* Visual On-Device Processing Flow Diagram */}
      <div className="mb-12 w-full max-w-2xl px-4">
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#141414] border border-[#2b2b2b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-white/90">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="font-semibold">Microphone</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="hidden sm:inline">────────►</span>
            <span className="sm:hidden">▼</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#1f1f1f] border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Your Computer (whisper.cpp)</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="hidden sm:inline">────────►</span>
            <span className="sm:hidden">▼</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="font-semibold">Any App Cursor</span>
          </div>
        </div>
        <div className="flex justify-between items-center px-2 pt-2 text-[11px] font-mono text-white/50">
          <span>Outbound cloud audio: 0 bytes</span>
          <span className="text-emerald-400/90">Air-gapped & Offline ready</span>
        </div>
      </div>

      {/* Core 3-Part Value Pillar Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl w-full px-4 mb-16">
        <div className="p-3.5 rounded-xl bg-[#121212] border border-[#272727] text-left">
          <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>1. 100% Private</span>
          </div>
          <p className="text-[12px] text-white/60 leading-normal">
            Audio and transcripts never leave your machine. No cloud database.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#121212] border border-[#272727] text-left">
          <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>2. Instant & Offline</span>
          </div>
          <p className="text-[12px] text-white/60 leading-normal">
            No upload latency. Works on planes, trains, or with zero internet.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#121212] border border-[#272727] text-left">
          <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>3. App-Ready Writing</span>
          </div>
          <p className="text-[12px] text-white/60 leading-normal">
            Cleans filler words, fixes jargon, and structures markdown automatically.
          </p>
        </div>
      </div>

      {/* Interactive Desktop Transcription Simulator (B3: Nested radius formula) */}
      <div className="w-full max-w-4xl px-4">
        {/* Floating Murmur Glass Pill */}
        <div className="flex justify-center mb-4">
          <div
            onClick={() => startSimulation()}
            className="rounded-full bg-[#181818] border border-[#313131] px-4 py-2 flex items-center gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.8)] cursor-pointer hover:border-white/40 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <div className="flex items-center gap-2">
              {pillState === "idle" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                  <span className="text-xs font-mono text-white/80 font-medium">
                    Murmur ready · Click to test dictation
                  </span>
                </>
              )}

              {pillState === "listening" && (
                <>
                  <Mark size="sm" animated={true} />
                  <span className="text-xs font-mono text-white font-semibold">
                    Listening and streaming
                  </span>
                  <span className="text-xs font-mono text-white/70 bg-[#272727] px-2 py-0.5 rounded-full border border-[#313131]">
                    164 words per minute
                  </span>
                </>
              )}

              {pillState === "processing" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-spin" />
                  <span className="text-xs font-mono text-white/80 font-medium">
                    Formatting and removing fillers
                  </span>
                </>
              )}

              {pillState === "pasted" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span className="text-xs font-mono text-white font-semibold">
                    Pasted in 184ms
                  </span>
                </>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startSimulation();
              }}
              className="text-xs font-mono font-medium text-white/80 hover:text-white px-2 py-0.5 rounded-full bg-[#272727] hover:bg-[#313131] transition-colors border border-[#313131]"
            >
              {isSimulating ? "Replaying" : "Run demo"}
            </button>
          </div>
        </div>

        {/* Application Window Frame (B4: Flat background #181818, full border #313131, outer radius rounded-2xl) */}
        <div className="rounded-2xl bg-[#181818] border border-[#313131] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
          {/* Window Titlebar */}
          <div className="bg-[#1f1f1f] px-4 py-3 border-b border-[#313131] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131] inline-block" />
              <span className="text-xs font-mono text-white/60 ml-2">
                Target application: {selectedApp.name}
              </span>
            </div>

            {/* App Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#313131]">
              {APP_PRESETS.map((preset) => {
                const isSelected = selectedApp.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectApp(preset)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      isSelected
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-white/60 hover:text-white hover:bg-[#272727]"
                    }`}
                  >
                    {preset.name.split("&")[0].trim()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Body (outer rounded-2xl (16px) - 16px gap -> inner rounded-lg (8px)) */}
          <div className="p-4 sm:p-6 bg-[#181818] flex flex-col gap-4">
            {/* Raw Spoken Input Bar */}
            <div className="p-3.5 rounded-lg bg-[#1f1f1f] border border-[#313131] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white/50 font-semibold block mb-0.5">
                  Spoken voice input
                </span>
                <p className="text-xs text-white/80 font-mono">
                  &quot;{selectedApp.rawSpoken}&quot;
                </p>
              </div>

              <button
                onClick={() => startSimulation()}
                disabled={isSimulating}
                className="self-start sm:self-auto text-xs font-semibold text-white bg-[#272727] hover:bg-[#313131] border border-[#313131] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                Replay transcription
              </button>
            </div>

            {/* Formatted Output Canvas */}
            <div className="font-mono text-xs sm:text-sm text-white/90 leading-relaxed overflow-x-auto whitespace-pre-wrap p-4 rounded-lg bg-[#131209] border border-[#313131] min-h-[180px]">
              {typedText}
              {isSimulating && (
                <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-white/50 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  whisper.cpp engine active
                </span>
                <span>DirectML and Metal enabled</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Latency: 184ms</span>
                <span>Cloud upload: 0 bytes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
