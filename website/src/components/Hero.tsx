/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Mark } from "./Mark";

interface AppPreset {
  id: string;
  name: string;
  category: string;
  rawSpoken: string;
  formattedOutput: string;
}

const APP_PRESETS: AppPreset[] = [
  {
    id: "slack",
    name: "Slack",
    category: "Team Chat",
    rawSpoken:
      "hey team quick update on the latency benchmarks real time factor dropped to zero point two please test and report any bugs in eng channel",
    formattedOutput: `Hey team, quick update on the latency benchmarks:

• Real-time factor dropped to 0.20x with sub-180ms latency
• DirectML and Metal GPU offloading are active
• Please test your dictations and report any edge cases in #eng-bugs`,
  },
  {
    id: "cursor",
    name: "Cursor & VS Code",
    category: "Code & Commits",
    rawSpoken:
      "write an async function handlePaymentWebhook that validates stripe signatures and updates customer status in supabase",
    formattedOutput: `export async function handlePaymentWebhook(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) throw new Error("Missing stripe signature");

  const event = stripe.webhooks.constructEvent(
    await req.text(),
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
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
    id: "notion",
    name: "Notion & Linear",
    category: "Issues & Notes",
    rawSpoken:
      "bug template step one toggle air gap mode step two dictate paragraph step three verify zero packets in packet monitor",
    formattedOutput: `### [Bug Verification]: Air-Gap Network Egress
- **Steps to Reproduce:**
  1. Toggle Air-Gap mode in Settings
  2. Dictate paragraph across multiple apps
  3. Run packet monitor (\`pktmon\` or \`lulu\`)
- **Result:** 0 bytes outbound · 100% local decode
- **Status:** Verified ✅`,
  },
  {
    id: "mail",
    name: "Mail & Docs",
    category: "Executive Email",
    rawSpoken:
      "thanks for reaching out regarding our security model all speech processing runs locally on device with zero cloud telemetry",
    formattedOutput: `Hi Sarah,

Thanks for reaching out. Regarding our security model, all speech recognition and formatting runs entirely on device via local Whisper models. Zero audio or telemetry ever leaves your computer.

Let me know if you would like to review our plain-English privacy architecture.

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
  const [wifiDisabled, setWifiDisabled] = useState(false);

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
    }, 900);
  };

  const handleSelectApp = (preset: AppPreset) => {
    setSelectedApp(preset);
    setTypedText(preset.formattedOutput);
    setPillState("idle");
    setIsSimulating(false);
  };

  return (
    <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-[#000000] flex flex-col items-center">
      {/* Proof Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-8 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-white/90">
          100% On-Device · Zero Cloud Audio
        </span>
        <span className="text-xs font-mono text-white/60 pl-1 border-l border-[#313131]">
          macOS & Windows
        </span>
      </div>

      {/* Hero Headline & Subheadline answering: What is this? Why is it different? */}
      <div className="text-center max-w-[720px] px-4 mx-auto">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
          Speak freely.
          <span className="block text-gradient-hero mt-1">Keep everything private.</span>
        </h1>
        <p className="text-base sm:text-lg text-white/80 leading-relaxed font-normal mb-8">
          Private, local AI dictation for Mac and Windows. Your voice, transcript, and writing context stay on your computer—never uploaded for transcription or sold.
        </p>
      </div>

      {/* Primary CTA and Secondary Demo Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-4">
        <a
          href="#download"
          className="text-base font-semibold text-black bg-white hover:bg-white/90 px-7 py-3 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_24px_rgba(255,255,255,0.18)]"
        >
          Download free for {detectedOs === "mac" ? "macOS" : "Windows"}
        </a>
        <a
          href="#benchmarks"
          className="text-base font-semibold text-white/80 hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#313131] px-6 py-3 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          View speed benchmarks
        </a>
      </div>

      {/* Trust & Differentiation Bar answering: Why should I trust it? */}
      <p className="text-xs sm:text-sm font-mono text-white/50 mb-12 text-center px-4">
        Works offline · No cloud transcription · Built for sensitive work
      </p>

      {/* The 4 Core Answers Grid: What, Why Different, Who it's For, Why Trust */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl w-full px-4 mb-14 text-left">
        <div className="p-4 rounded-xl bg-[#121212] border border-[#272727]">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
            1. What is this?
          </span>
          <h3 className="text-xs font-bold text-white mb-1">Universal Dictation</h3>
          <p className="text-[11px] text-white/60 leading-normal">
            A system-wide push-to-talk pill that injects formatted text into any app on macOS and Windows.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#121212] border border-[#272727]">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
            2. Why is it different?
          </span>
          <h3 className="text-xs font-bold text-white mb-1">Physical Architecture</h3>
          <p className="text-[11px] text-white/60 leading-normal">
            Runs whisper.cpp on your GPU. 0 bytes audio leave your RAM. ~3x faster than cloud round-trips.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#121212] border border-[#272727]">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
            3. Who is it for?
          </span>
          <h3 className="text-xs font-bold text-white mb-1">High-Trust Teams</h3>
          <p className="text-[11px] text-white/60 leading-normal">
            Engineers, lawyers, executives, doctors, and founders who cannot leak sensitive thoughts to the cloud.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#121212] border border-[#272727]">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
            4. Why trust it?
          </span>
          <h3 className="text-xs font-bold text-white mb-1">Verifiable by Anyone</h3>
          <p className="text-[11px] text-white/60 leading-normal">
            Auditable via Wireshark or Little Snitch. 0 accounts required. Zero telemetry SDKs inside binary.
          </p>
        </div>
      </div>

      {/* Interactive Desktop Product Simulator */}
      <div className="w-full max-w-4xl px-4">
        {/* Simulator Controls & Wi-Fi Off Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div
            onClick={() => startSimulation()}
            className="rounded-full bg-[#181818] border border-[#313131] px-4 py-2 flex items-center gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.8)] cursor-pointer hover:border-white/40 transition-all"
          >
            <div className="flex items-center gap-2">
              {pillState === "idle" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-white/80 font-medium">
                    Murmur ready · Click to dictate
                  </span>
                </>
              )}

              {pillState === "listening" && (
                <>
                  <Mark size="sm" animated={true} />
                  <span className="text-xs font-mono text-white font-semibold">
                    Listening on-device...
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-[#272727] px-2 py-0.5 rounded-full border border-[#313131]">
                    VAD Active
                  </span>
                </>
              )}

              {pillState === "processing" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-spin" />
                  <span className="text-xs font-mono text-white/80 font-medium">
                    Formatting locally ({wifiDisabled ? "Offline Mode" : "RAM Buffer"})
                  </span>
                </>
              )}

              {pillState === "pasted" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-white font-semibold">
                    Injected in 172ms · 0 bytes cloud
                  </span>
                </>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startSimulation();
              }}
              className="text-xs font-mono font-medium text-white/80 hover:text-white px-2.5 py-0.5 rounded-full bg-[#272727] hover:bg-[#313131] transition-colors border border-[#313131]"
            >
              {isSimulating ? "Dictating..." : "Push to talk"}
            </button>
          </div>

          {/* Wi-Fi Simulator Toggle ("Switch Wi-Fi off and dictate again") */}
          <div className="flex items-center gap-2 bg-[#141414] border border-[#2c2c2c] px-3 py-1.5 rounded-full text-xs font-mono">
            <span className="text-white/60">Simulate Wi-Fi:</span>
            <button
              onClick={() => setWifiDisabled(!wifiDisabled)}
              className={`px-2.5 py-0.5 rounded-full transition-colors font-bold ${
                wifiDisabled
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {wifiDisabled ? "✈️ Disconnected (Airplane Mode)" : "📶 Connected"}
            </button>
          </div>
        </div>

        {/* Application Window Frame */}
        <div className="rounded-2xl bg-[#181818] border border-[#313131] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
          {/* Window Titlebar */}
          <div className="bg-[#1f1f1f] px-4 py-3 border-b border-[#313131] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131] inline-block" />
              <span className="text-xs font-mono text-white/60 ml-2">
                Focused app: {selectedApp.name} ({selectedApp.category})
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
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
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

          {/* Editor Body */}
          <div className="p-4 sm:p-6 bg-[#181818] flex flex-col gap-4">
            {/* Raw Spoken Input Bar */}
            <div className="p-3.5 rounded-lg bg-[#1f1f1f] border border-[#313131] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white/50 font-semibold block mb-0.5">
                  Natural spoken voice (messy raw speech)
                </span>
                <p className="text-xs text-white/80 font-mono">
                  &quot;{selectedApp.rawSpoken}&quot;
                </p>
              </div>

              <button
                onClick={() => startSimulation()}
                disabled={isSimulating}
                className="self-start sm:self-auto text-xs font-semibold text-white bg-[#272727] hover:bg-[#313131] border border-[#313131] px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSimulating ? "Transcribing..." : "Dictate this"}
              </button>
            </div>

            {/* Formatted Output Canvas */}
            <div className="font-mono text-xs sm:text-sm text-white/90 leading-relaxed overflow-x-auto whitespace-pre-wrap p-4 rounded-lg bg-[#131209] border border-[#313131] min-h-[180px]">
              {typedText}
              {isSimulating && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
              )}
            </div>

            {/* Bottom Status Bar with Local Processing & Network Proof */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-white/50 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Local processing: whisper.cpp
                </span>
                <span>DirectML / Metal GPU</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Latency: ~172ms</span>
                <span className="text-emerald-300 font-semibold">Network egress: 0 bytes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
