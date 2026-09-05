/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  ShieldCheck,
  Eye,
  Lock,
  WifiOff,
  Wifi,
  Terminal,
  ArrowRight,
  Sparkles,
  Command,
  Check,
} from "lucide-react";

interface AppPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  rawSpoken: string;
  formattedOutput: string;
}

const APP_PRESETS: AppPreset[] = [
  {
    id: "slack",
    name: "Slack",
    category: "Team Chat",
    icon: "#",
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
    icon: "{ }",
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
    icon: "≡",
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
    icon: "✉",
    rawSpoken:
      "thanks for reaching out regarding our security model all speech processing runs locally on device with zero cloud telemetry",
    formattedOutput: `Hi Sarah,

Thanks for reaching out. Regarding our security model, all speech recognition and formatting runs entirely on device via local Whisper models. Zero audio or telemetry ever leaves your computer.

Let me know if you would like to review our plain-English privacy architecture.

Best regards,
Alex`,
  },
  {
    id: "github-airplane",
    name: "GitHub (Airplane Mode)",
    category: "Air-Gapped Issue",
    icon: "✈",
    rawSpoken:
      "issue title memory leak in webview audio buffer description steps to reproduce toggle air gap mode disconnect wifi dictate five paragraphs expected behavior memory stays flat at eighty megabytes with zero network egress observed behavior verified zero bytes sent via packet monitor",
    formattedOutput: `### Bug: Memory Profile & Network Egress in Air-Gap Mode

**Steps to Reproduce:**
1. Toggle Airplane / Air-Gap Mode in Murmur Settings
2. Disconnect Wi-Fi and Ethernet (\`0 bytes/sec\` egress)
3. Dictate 5 continuous paragraphs into the issue editor

**Expected Behavior:**
- Working set memory stays flat at ~80MB
- 0 bytes outbound packets captured in packet monitor (\`pktmon\` / \`lulu\`)
- Text arrives instantly at cursor with sub-200ms latency

**Audit Result:**
Verified ✅ — 100% on-device Whisper decode. 0 bytes transmitted over network.`,
  },
  {
    id: "chatgpt",
    name: "ChatGPT & Claude",
    category: "AI Prompts",
    icon: "✦",
    rawSpoken:
      "summarize our competitive advantage in private on-device dictation focusing on zero cloud streaming and sub-200ms latency",
    formattedOutput: `Please analyze and structure our positioning for on-device AI dictation:

1. Technical Moat: whisper.cpp running 100% locally via Apple Metal / Windows DirectML (sub-180ms latency)
2. Verifiable Privacy: 0 bytes outbound egress, audited by Wireshark/LuLu, zero accounts required
3. Workflow Impact: Universal global hotkey typing directly into any active app without clipboard hijack`,
  },
];

export function Hero() {
  const [selectedApp, setSelectedApp] = useState<AppPreset>(APP_PRESETS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [typedText, setTypedText] = useState(APP_PRESETS[0].formattedOutput);
  const [pillState, setPillState] = useState<"idle" | "listening" | "processing" | "pasted">("idle");
  const [detectedOs, setDetectedOs] = useState<"mac" | "windows" | "linux">("mac");
  const [wifiDisabled, setWifiDisabled] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([14, 28, 45, 75, 40, 60, 25, 55, 30, 15]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes("win")) setDetectedOs("windows");
      else if (userAgent.includes("mac")) setDetectedOs("mac");
      else setDetectedOs("linux");
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pillState === "listening") {
      interval = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 15)
        );
      }, 80);
    } else {
      setWaveformBars([12, 16, 20, 24, 20, 16, 12, 16, 20, 16, 12, 16]);
    }
    return () => clearInterval(interval);
  }, [pillState]);

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
      const speed = Math.max(8, Math.floor(1400 / target.length));

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
          }, 3500);
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
    <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden flex flex-col items-center bg-[#ffffff] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Subtle Ambient Light Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching the screenshot */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      {/* Top Badge: Pill with Red Dot matching the screenshot */}
      <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-8 transition-transform hover:scale-[1.02] cursor-default z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
        <span className="text-sm font-medium text-neutral-800">We are hiring</span>
      </div>

      {/* Two-Tier Headline matching the screenshot */}
      <div className="relative text-center max-w-4xl px-4 mx-auto mb-6 z-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold tracking-[-0.035em] text-neutral-950 mb-6 leading-[1.06]">
          Speak naturally.
          <span className="block text-[#737373] font-bold mt-1 sm:mt-2">
            Keep it private.
          </span>
        </h1>

        {/* Subtitle with Inline Badges matching the screenshot */}
        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Turn your voice into polished text in any app — processed locally on your PC or Mac through key guarantees like{" "}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-xs sm:text-sm font-medium text-neutral-800 align-middle my-1">
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
            <span>No uploaded audio</span>
          </span>
          {" , "}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-xs sm:text-sm font-medium text-neutral-800 align-middle my-1">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>0 cloud transcripts</span>
          </span>
          {" , and "}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-xs sm:text-sm font-medium text-neutral-800 align-middle my-1">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Zero data selling</span>
          </span>
        </p>
      </div>

      {/* Two CTA Buttons matching the screenshot */}
      <div className="relative flex flex-col sm:flex-row items-center gap-3.5 mb-14 z-10">
        <a
          href="mailto:sales@murmur.app?subject=Murmur%20Enterprise%20and%20Team%20Inquiry"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-sm text-sm font-semibold text-neutral-800 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          <span className="w-3 h-3 rounded-[3px] bg-neutral-200/80 border border-neutral-300" />
          <span>Talk to Sales</span>
        </a>
        <a
          href="#download"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#141416] hover:bg-neutral-800 text-white text-sm font-semibold shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Start Free Trial</span>
          <span className="text-xs text-neutral-400 font-normal">
            ({detectedOs === "mac" ? "macOS" : "Windows"})
          </span>
        </a>
      </div>

      {/* Pixelated square-cell matrix grid matching screenshot */}
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none opacity-45 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white_35%,white)]">
        <svg className="w-full h-full text-neutral-300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pixel-matrix-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect x="2" y="2" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pixel-matrix-grid)" />
        </svg>
      </div>

      {/* Interactive Desktop Product Simulator */}
      <div className="w-full max-w-5xl px-4 relative z-10">
        {/* Simulator Controls & Wi-Fi Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          {/* Floating Push-To-Talk Island */}
          <div
            onClick={() => startSimulation()}
            className="group rounded-full bg-[#0d0d10]/90 border border-white/[0.12] hover:border-emerald-500/50 px-4 py-2.5 flex items-center gap-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)] cursor-pointer transition-all duration-300"
          >
            <div className="flex items-center gap-2.5">
              {pillState === "idle" && (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-mono text-neutral-300 font-medium group-hover:text-white">
                    Murmur ready · Click to dictate
                  </span>
                </>
              )}

              {pillState === "listening" && (
                <>
                  <div className="flex items-center gap-0.5 h-4">
                    {waveformBars.slice(0, 6).map((bar, i) => (
                      <span
                        key={i}
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(4, bar / 3)}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-white font-semibold">
                    Listening on-device...
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    VAD active
                  </span>
                </>
              )}

              {pillState === "processing" && (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent motion-safe:animate-spin" />
                  <span className="text-xs font-mono text-neutral-200 font-medium">
                    Local GPU inference ({wifiDisabled ? "air-gap mode" : "direct VRAM"})
                  </span>
                </>
              )}

              {pillState === "pasted" && (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                  <span className="text-xs font-mono text-white font-semibold">
                    Injected in 172ms
                  </span>
                </>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startSimulation();
              }}
              className="text-xs font-mono font-medium text-black bg-white hover:bg-zinc-200 px-3 py-1 rounded-full shadow-sm transition-all flex items-center gap-1"
            >
              {isSimulating ? (
                <span>Speaking...</span>
              ) : (
                <>
                  <Command className="w-3 h-3" />
                  <span>Space</span>
                </>
              )}
            </button>
          </div>

          {/* Wi-Fi Simulator Toggle */}
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span className="text-neutral-400">Network simulation:</span>
            <button
              onClick={() => setWifiDisabled(!wifiDisabled)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all font-semibold ${
                wifiDisabled
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {wifiDisabled ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Airplane mode (0 net)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Application Window Frame */}
        <div className="rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.1] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)]">
          {/* Window Titlebar */}
          <div className="bg-white/[0.03] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block opacity-80" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block opacity-80" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block opacity-80" />
              <span className="text-xs font-mono text-neutral-400 ml-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                Target app: <strong className="text-neutral-200">{selectedApp.name}</strong>
              </span>
            </div>

            {/* App Switcher Tabs */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
              {APP_PRESETS.map((preset) => {
                const isSelected = selectedApp.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectApp(preset)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="text-[10px] font-mono opacity-60">{preset.icon}</span>
                    <span>{preset.name.split("&")[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Body */}
          <div className="p-5 sm:p-7 bg-[#0b0b0e]/70 flex flex-col gap-4">
            {/* Raw Spoken Input Bar */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-400 block mb-1">
                  What you said, unedited
                </span>
                <p className="text-xs sm:text-sm text-neutral-300 font-mono">
                  &ldquo;{selectedApp.rawSpoken}&rdquo;
                </p>
              </div>

              <button
                onClick={() => startSimulation()}
                disabled={isSimulating}
                className="self-start sm:self-auto text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] px-4 py-2 rounded-lg transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSimulating ? "Transcribing..." : "Simulate dictation"}</span>
              </button>
            </div>

            {/* Formatted Output Canvas */}
            <div className="font-mono text-xs sm:text-sm text-neutral-100 leading-relaxed overflow-x-auto whitespace-pre-wrap p-5 rounded-xl bg-[#060608] border border-white/[0.08] min-h-[200px] shadow-inner relative">
              {typedText}
              {isSimulating && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 motion-safe:animate-pulse shadow-[0_0_8px_#10b981]" />
              )}
            </div>

            {/* Bottom Status Bar — this is the one place "0 bytes" and latency live */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-neutral-400 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  whisper.cpp DirectML / Metal
                </span>
                <span className="text-neutral-500 hidden sm:inline">Model: Whisper Small (190 MB)</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Latency: ~172ms</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Network egress: 0 bytes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}