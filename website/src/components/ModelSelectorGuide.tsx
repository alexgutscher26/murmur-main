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
    <section id="models" className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white">
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
              Local Whisper Architecture
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Select the right model for your device.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
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
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-[#141416] text-white font-semibold border-[#141416] shadow-md scale-[1.01]"
                    : "bg-white text-neutral-600 border border-neutral-200/80 hover:text-neutral-950 hover:bg-neutral-50 shadow-sm"
                }`}
              >
                <span className="text-xs font-bold block truncate">{model.name}</span>
                <span className={`text-[10px] font-mono block ${isSelected ? "text-neutral-400" : "text-neutral-500"}`}>
                  {model.size} · {model.latency}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Model Details Panel */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <h3 className="text-xl font-bold text-neutral-950">
                  {selectedModel.name}
                </h3>
                {selectedModel.badge && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold">
                    {selectedModel.badge}
                  </span>
                )}
              </div>

              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-5">
                {selectedModel.description}
              </p>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs">
                <span className="font-bold text-neutral-900 block mb-1">
                  Optimal Hardware & Use-Case:
                </span>
                <span className="text-neutral-600">{selectedModel.recommendedFor}</span>
              </div>
            </div>

            {/* Metrics HUD */}
            <div className="md:col-span-5 grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block text-[10px] uppercase">Latency</span>
                <span className="font-bold text-neutral-950 text-base">{selectedModel.latency}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block text-[10px] uppercase">Disk Size</span>
                <span className="font-bold text-neutral-950 text-base">{selectedModel.size}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block text-[10px] uppercase">RAM Usage</span>
                <span className="font-bold text-neutral-950 text-base">{selectedModel.ramUsage}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/90">
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">Accuracy</span>
                <span className="font-bold text-emerald-700 text-base">{selectedModel.accuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
