"use client";

import { useState } from "react";
import { Cpu } from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  badge?: string;
  size: string;
  latency: string;
  ramUsage: string;
  accuracy: number;
  description: string;
  recommendedFor: string;
}

const MODELS: ModelInfo[] = [
  {
    id: "base",
    name: "Whisper Base (q5_1)",
    badge: "Lightweight Instant",
    size: "90 MB",
    latency: "95 ms",
    ramUsage: "250 MB",
    accuracy: 96.0,
    description: "Ultra lightweight model for older laptops or constrained hardware with instantaneous decoding.",
    recommendedFor: "Older laptops, battery conservation, quick messages and commands",
  },
  {
    id: "small",
    name: "Whisper Small (q5_1)",
    badge: "Default Recommended",
    size: "190 MB",
    latency: "160 ms",
    ramUsage: "450 MB",
    accuracy: 98.5,
    description: "The official default for all users. Optimal balance of sub-200ms speed, low memory footprint, and accurate punctuation.",
    recommendedFor: "Software developers, daily dictation, technical notes, bilingual typing",
  },
  {
    id: "turbo-q4",
    name: "Large v3 Turbo (q4_0)",
    badge: "Turbo 4-bit",
    size: "460 MB",
    latency: "140 ms",
    ramUsage: "850 MB",
    accuracy: 99.2,
    description: "Compact 4-bit quantization of Large Turbo delivering near-perfect fidelity with reduced RAM footprint.",
    recommendedFor: "Pro users on 8 GB RAM laptops wanting Turbo accuracy",
  },
  {
    id: "turbo-q5",
    name: "Large v3 Turbo (q5_0)",
    badge: "State of the Art",
    size: "574 MB",
    latency: "190 ms",
    ramUsage: "1.1 GB",
    accuracy: 99.7,
    description: "Latest turbo architecture unlocking maximum precision across all 99 languages and heavy accents with DirectML/Metal acceleration.",
    recommendedFor: "Medical, legal, engineering architecture, specialized vocabulary, 99 languages",
  },
  {
    id: "turbo-q8",
    name: "Large v3 Turbo (q8_0)",
    badge: "Maximum Precision",
    size: "874 MB",
    latency: "230 ms",
    ramUsage: "1.6 GB",
    accuracy: 99.9,
    description: "Near-unquantized 8-bit precision for zero-compromise multilingual translation and technical dictation.",
    recommendedFor: "Highest fidelity across subtle accents and multi-speaker audio",
  },
];

export function ModelSelectorGuide() {
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(MODELS[1]);

  return (
    <section id="models" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Local Whisper Architecture
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Select the right model for your device.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Murmur runs 100% on device with Whisper GGML models. Whisper Small (190 MB) is included free by default; download any model weights with one click.
          </p>
        </div>

        {/* Model Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {MODELS.map((model) => {
            const isSelected = selectedModel.id === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-white text-black font-semibold border-white shadow-lg scale-[1.01]"
                    : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span className="text-xs font-bold block truncate">{model.name}</span>
                <span className={`text-[10px] font-mono block ${isSelected ? "text-zinc-700" : "text-zinc-500"}`}>
                  {model.size} · {model.latency}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Model Details Panel */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <h3 className="text-xl font-bold text-white">
                  {selectedModel.name}
                </h3>
                {selectedModel.badge && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    {selectedModel.badge}
                  </span>
                )}
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-5">
                {selectedModel.description}
              </p>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                <span className="font-bold text-white block mb-1">
                  Optimal Hardware & Use-Case:
                </span>
                <span className="text-zinc-400">{selectedModel.recommendedFor}</span>
              </div>
            </div>

            {/* Metrics HUD */}
            <div className="md:col-span-5 grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-zinc-500 block text-[10px] uppercase">Latency</span>
                <span className="font-bold text-white text-base">{selectedModel.latency}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-zinc-500 block text-[10px] uppercase">Disk Size</span>
                <span className="font-bold text-white text-base">{selectedModel.size}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-zinc-500 block text-[10px] uppercase">RAM Usage</span>
                <span className="font-bold text-white text-base">{selectedModel.ramUsage}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-zinc-500 block text-[10px] uppercase">Accuracy</span>
                <span className="font-bold text-emerald-400 text-base">{selectedModel.accuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
