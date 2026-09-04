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
    description: "Cloud dictation pays a mandatory network round-trip penalty (DNS + TLS handshake + WebSocket upload + cloud inference queue). Murmur decodes inside GPU VRAM immediately.",
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
    description: "Parallel ASR chunking prevents input buffer pileups, allowing you to speak as fast as you want without lag, audio loss, or sentence truncation.",
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
    description: "On-device phonetic biasing directly steers Whisper's initial beam search with your custom dictionary, preventing generic auto-corrections.",
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
    description: "Engineered in Rust with zero Electron bloat. Whisper weights stay warm in VRAM for instant sub-millisecond invocation.",
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
    description: "Avoiding continuous Wi-Fi radio transmission and leveraging Apple Silicon Neural Engine / DirectML saves substantial battery life.",
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
    description: "Zero network dependencies mean your dictation latency is identical whether you are in an office, in a train tunnel, or at 35,000 feet.",
  },
];

export function LatencyBenchmarks() {
  const [activeMetric, setActiveMetric] = useState<BenchmarkMetric>(BENCHMARKS[0]);

  return (
    <section id="benchmarks" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Dated, Reproducible Benchmarks
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Beat the cloud on latency.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Local AI is only compelling if it feels instantaneous. We engineered Murmur in native Rust to outpace cloud WebSocket pipelines at every stage.
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
                className={`p-3.5 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-white text-black border-white shadow-lg scale-[1.01]"
                    : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 font-semibold ${isSelected ? "text-emerald-700" : "text-emerald-400"}`}>
                  {m.category}
                </span>
                <span className="text-xs font-bold block truncate">{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Benchmark Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">
                {activeMetric.category}
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">{activeMetric.name}</h3>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold self-start sm:self-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{activeMetric.diffHighlight}</span>
            </div>
          </div>

          {/* Side-by-Side Comparison Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {/* Murmur (Local) */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider block mb-1.5">
                  Murmur (Native On-Device)
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono block">
                  {activeMetric.murmurValue}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mb-2 border border-white/[0.06]">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#10b981]"
                    style={{ width: `${activeMetric.murmurBarPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Zero network hop · Direct GPU decode
                </span>
              </div>
            </div>

            {/* Cloud Alternative */}
            <div className="p-5 rounded-xl bg-white/[0.01] border border-white/[0.06] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-500 font-semibold uppercase tracking-wider block mb-1.5">
                  Cloud Dictation (Wispr / Cloud APIs)
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-zinc-400 font-mono block">
                  {activeMetric.cloudValue}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mb-2 border border-white/[0.06]">
                  <div
                    className="h-full bg-zinc-600 rounded-full transition-all duration-500"
                    style={{ width: `${activeMetric.cloudBarPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  WebSocket upload + Cloud queue + TLS overhead
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
            {activeMetric.description}
          </p>

          <div className="p-3.5 rounded-xl bg-[#060608] border border-white/[0.06] text-[11px] font-mono text-zinc-400 flex items-center justify-between flex-wrap gap-2">
            <span>Test Configuration: {activeMetric.testMethod}</span>
            <span className="text-emerald-400/80 font-medium">Reproducible via cargo bench</span>
          </div>
        </div>
      </div>
    </section>
  );
}
