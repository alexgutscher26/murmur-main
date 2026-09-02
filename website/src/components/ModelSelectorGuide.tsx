"use client";

import { useState } from "react";

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
    badge: "Starter Default",
    size: "190 MB",
    latency: "160 ms",
    ramUsage: "450 MB",
    accuracy: 98.5,
    description: "The official default for Starter users. Optimal balance of sub-200ms speed, low memory, and accurate punctuation.",
    recommendedFor: "Software developers, daily dictation, technical notes, bilingual typing",
  },
  {
    id: "turbo-q4",
    name: "Large v3 Turbo (q4_0)",
    badge: "Pro Model",
    size: "460 MB",
    latency: "140 ms",
    ramUsage: "850 MB",
    accuracy: 99.2,
    description: "Compact 4-bit quantisation of Large Turbo delivering near-perfect fidelity with reduced RAM footprint.",
    recommendedFor: "Pro users on 8 GB RAM laptops wanting Turbo accuracy",
  },
  {
    id: "turbo-q5",
    name: "Large v3 Turbo (q5_0)",
    badge: "Pro · State of the Art",
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
    badge: "Pro High Fidelity",
    size: "874 MB",
    latency: "230 ms",
    ramUsage: "1.6 GB",
    accuracy: 99.9,
    description: "Near-unquantised 8-bit precision for zero-compromise multilingual translation and technical dictation.",
    recommendedFor: "Highest fidelity across subtle accents and multi-speaker audio",
  },
];

export function ModelSelectorGuide() {
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(MODELS[1]);

  return (
    <section id="models" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
            Local Whisper Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Select the right model for your device.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Murmur runs 100% on device with Whisper GGML models. Whisper Small (190 MB) is included free on Starter; unlock Large Turbo with Pro.
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
                className={`p-3 rounded-lg border text-left transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isSelected
                    ? "bg-white text-black font-semibold border-white"
                    : "bg-[#181818] text-white/70 border-[#313131] hover:text-white hover:bg-[#1f1f1f]"
                }`}
              >
                <span className="text-xs font-bold block truncate">{model.name}</span>
                <span className={`text-[10px] font-mono block ${isSelected ? "text-black/70" : "text-white/50"}`}>
                  {model.size}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Model Details Panel */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#181818] border border-[#313131]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">
                  {selectedModel.name}
                </h3>
                {selectedModel.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#272727] text-white border border-[#313131]">
                    {selectedModel.badge}
                  </span>
                )}
              </div>

              <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-4">
                {selectedModel.description}
              </p>

              <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131] text-xs">
                <span className="font-semibold text-white block mb-0.5">
                  Recommended for:
                </span>
                <span className="text-white/70">{selectedModel.recommendedFor}</span>
              </div>
            </div>

            {/* Metrics HUD */}
            <div className="md:col-span-5 grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                <span className="text-white/50 block text-[10px] uppercase">Latency</span>
                <span className="font-bold text-white text-base">{selectedModel.latency}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                <span className="text-white/50 block text-[10px] uppercase">Disk size</span>
                <span className="font-bold text-white text-base">{selectedModel.size}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                <span className="text-white/50 block text-[10px] uppercase">RAM usage</span>
                <span className="font-bold text-white text-base">{selectedModel.ramUsage}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
                <span className="text-white/50 block text-[10px] uppercase">Accuracy</span>
                <span className="font-bold text-white text-base">{selectedModel.accuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
