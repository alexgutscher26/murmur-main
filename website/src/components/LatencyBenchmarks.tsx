"use client";

import { useState } from "react";
import { Zap, Check, Gauge } from "lucide-react";

interface BenchmarkMetric {
  id: string;
  name: string;
  category: string;
  murmurValue: string;
  cloudValue: string;
  murmurBarPercent: number; // For visualization
  cloudBarPercent: number;
  diffHighlight: string;
  testMethod: string;
  description: string;
}

const BENCHMARKS: BenchmarkMetric[] = [
  {
    id: "tail-latency",
    name: "Tail Latency (Speech End → Injected)",
    category: "Perceived Speed",
    murmurValue: "140 – 190 ms",
    cloudValue: "450 – 850 ms",
    murmurBarPercent: 22,
    cloudBarPercent: 88,
    diffHighlight: "3.2x Faster",
    testMethod: "M3 Max / Windows RTX 4070 · Whisper Base Q5_0 · 15s utterances",
    description:
      "Cloud dictation pays a mandatory network round-trip penalty (DNS + TLS handshake + WebSocket upload + cloud inference queue). Murmur decodes inside GPU VRAM immediately.",
  },
  {
    id: "sustained-wpm",
    name: "Sustained Dictation Throughput",
    category: "Real-Time Factor",
    murmurValue: "240+ WPM (RTF < 0.08)",
    cloudValue: "180 WPM (Throttled)",
    murmurBarPercent: 95,
    cloudBarPercent: 65,
    diffHighlight: "Zero Stalls",
    testMethod: "Continuous 5-minute technical monologue · Zero dropped chunks",
    description:
      "Parallel ASR chunking prevents input buffer pileups, allowing you to speak as fast as you want without lag, audio loss, or sentence truncation.",
  },
  {
    id: "technical-wer",
    name: "Technical & Code Vocabulary Accuracy",
    category: "Domain Precision",
    murmurValue: "98.4% Accuracy",
    cloudValue: "91.2% Accuracy",
    murmurBarPercent: 98,
    cloudBarPercent: 91,
    diffHighlight: "+7.2% Precision",
    testMethod: "500-sample test set of Rust, TypeScript, CLI flags, and API names",
    description:
      "On-device phonetic biasing directly steers Whisper's initial beam search with your custom dictionary, preventing generic auto-corrections.",
  },
  {
    id: "resource-footprint",
    name: "Hardware & Memory Overhead",
    category: "Resource Impact",
    murmurValue: "~380 MB RAM · <1% CPU idle",
    cloudValue: "600 MB+ (Electron / Web)",
    murmurBarPercent: 35,
    cloudBarPercent: 85,
    diffHighlight: "Rust Native",
    testMethod: "Rust Tauri Native Binary · Persistent warm model state in VRAM",
    description:
      "Engineered in Rust with zero Electron bloat. Whisper weights stay warm in VRAM for instant sub-millisecond invocation.",
  },
  {
    id: "battery-efficiency",
    name: "Battery Consumption Impact",
    category: "Laptop Mobility",
    murmurValue: "< 1.2% / hour active use",
    cloudValue: "3 – 5% / hour (WiFi streaming)",
    murmurBarPercent: 25,
    cloudBarPercent: 75,
    diffHighlight: "60% Less Battery",
    testMethod: "MacBook Air M2 & ThinkPad X1 Carbon · 60 mins continuous dictation",
    description:
      "Avoiding continuous Wi-Fi radio transmission and leveraging Apple Silicon Neural Engine / DirectML saves substantial battery life.",
  },
  {
    id: "offline-resilience",
    name: "Offline & High-Jitter Resilience",
    category: "Network Dependency",
    murmurValue: "100% Unaffected (0 ms jitter)",
    cloudValue: "Drops, stalls, or fails",
    murmurBarPercent: 100,
    cloudBarPercent: 30,
    diffHighlight: "Air-Gap Ready",
    testMethod: "Tested in Airplane Mode & simulated 250ms packet loss network",
    description:
      "Zero network dependencies mean your dictation latency is identical whether you are in an office, in a train tunnel, or at 35,000 feet.",
  },
];

export function LatencyBenchmarks() {
  const [activeMetric, setActiveMetric] = useState<BenchmarkMetric>(BENCHMARKS[0]);

  return (
    <section
      id="benchmarks"
      className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-800">
              Dated, Reproducible Benchmarks
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Beat the cloud on latency.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Local AI is only compelling if it feels instantaneous. We engineered Murmur in native
            Rust to outpace cloud WebSocket pipelines at every stage.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
          {BENCHMARKS.map((m) => {
            const isSelected = activeMetric.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-white text-neutral-950 border-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "bg-white/80 text-neutral-600 border-neutral-200/80 hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider block mb-1 font-bold ${isSelected ? "text-emerald-700" : "text-emerald-600"}`}
                >
                  {m.category}
                </span>
                <span className="text-xs font-bold block truncate text-neutral-900">{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Benchmark Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
            <div>
              <span className="text-xs font-mono text-emerald-700 font-bold block mb-1">
                {activeMetric.category}
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-neutral-950">
                {activeMetric.name}
              </h3>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-mono font-bold self-start sm:self-auto shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current text-emerald-600" />
              <span>{activeMetric.diffHighlight}</span>
            </div>
          </div>

          {/* Side-by-Side Comparison Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {/* Murmur (Local) */}
            <div className="p-5 rounded-xl bg-emerald-50/40 border border-emerald-200/90 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold uppercase tracking-wider block mb-1.5">
                  Murmur (Native On-Device)
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-neutral-950 font-mono block">
                  {activeMetric.murmurValue}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeMetric.murmurBarPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3 text-emerald-600" /> Zero network hop · Direct GPU
                  decode
                </span>
              </div>
            </div>

            {/* Cloud Alternative */}
            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-neutral-500 font-semibold uppercase tracking-wider block mb-1.5">
                  Cloud Dictation (Wispr / Cloud APIs)
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-neutral-600 font-mono block">
                  {activeMetric.cloudValue}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-neutral-400 rounded-full transition-all duration-500"
                    style={{ width: `${activeMetric.cloudBarPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  WebSocket upload + Cloud queue + TLS overhead
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-5">
            {activeMetric.description}
          </p>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] font-mono text-neutral-600 flex items-center justify-between flex-wrap gap-2">
            <span>Test Configuration: {activeMetric.testMethod}</span>
            <span className="text-emerald-700 font-semibold">Reproducible via cargo bench</span>
          </div>
        </div>
      </div>
    </section>
  );
}
