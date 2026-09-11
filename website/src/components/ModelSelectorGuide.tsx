"use client";

import { useState, useMemo } from "react";
import { Sparkles, CheckCircle2, ShieldCheck, Zap, HardDrive, Cpu, Languages } from "lucide-react";

export interface ModelInfo {
  id: string;
  name: string;
  tier: "Lightweight" | "Balanced" | "Pro" | "Distilled";
  badge?: string;
  size: string;
  latency: string;
  ramUsage: string;
  accuracy: number;
  description: string;
  recommendedFor: string;
  quantization: string;
  languages: "99 Languages" | "English Only";
  fileName: string;
  isDefault?: boolean;
  popular?: boolean;
}

export const MODELS: ModelInfo[] = [
  {
    id: "tiny-q5_1",
    name: "Whisper Tiny (q5_1)",
    tier: "Lightweight",
    badge: "Ultra-Light 32 MB",
    size: "32 MB",
    latency: "35 ms",
    ramUsage: "100 MB",
    accuracy: 90.5,
    description:
      "Ultra-compact 5-bit quantized Tiny model. The lowest memory footprint in the catalog with sub-40ms response times.",
    recommendedFor: "RAM-constrained devices, background task decodes, legacy hardware",
    quantization: "q5_1 Quantized",
    languages: "99 Languages",
    fileName: "ggml-tiny-q5_1.bin",
  },
  {
    id: "base-q5_1",
    name: "Whisper Base (q5_1)",
    tier: "Lightweight",
    badge: "Instant Battery Saver",
    size: "60 MB",
    latency: "65 ms",
    ramUsage: "250 MB",
    accuracy: 95.0,
    description:
      "Instantaneous decoding with low resource consumption. Ideal for quick messages, system voice commands, and older laptops.",
    recommendedFor: "Older laptops, battery conservation, quick messages, instant command entry",
    quantization: "q5_1 Quantized",
    languages: "99 Languages",
    fileName: "ggml-base-q5_1.bin",
    popular: true,
  },
  {
    id: "small-q5_1",
    name: "Whisper Small (q5_1)",
    tier: "Balanced",
    badge: "Default Recommended",
    size: "190 MB",
    latency: "150 ms",
    ramUsage: "450 MB",
    accuracy: 98.5,
    description:
      "The official out-of-the-box default for all users. The ultimate balance of sub-200ms speed, low memory footprint, and high punctuation accuracy.",
    recommendedFor: "Software developers, daily dictation, technical notes, bilingual typing",
    quantization: "q5_1 Quantized",
    languages: "99 Languages",
    fileName: "ggml-small-q5_1.bin",
    isDefault: true,
    popular: true,
  },
  {
    id: "small.en-tdrz",
    name: "Whisper Small (tdrz)",
    tier: "Balanced",
    badge: "Speaker Diarization",
    size: "488 MB",
    latency: "180 ms",
    ramUsage: "950 MB",
    accuracy: 98.4,
    description:
      "Specialized TinyDiarize model trained to detect and output speaker turn tokens automatically during transcription.",
    recommendedFor: "Meeting transcriptions, multi-speaker interviews, podcast drafting",
    quantization: "Full Precision (tdrz)",
    languages: "English Only",
    fileName: "ggml-small.en-tdrz.bin",
  },
  {
    id: "medium-q5_0",
    name: "Whisper Medium (q5_0)",
    tier: "Pro",
    badge: "Multilingual Pro",
    size: "539 MB",
    latency: "240 ms",
    ramUsage: "1.0 GB",
    accuracy: 98.9,
    description:
      "Pro model providing exceptional accuracy across all 99 languages with balanced RAM consumption at 5-bit quantization.",
    recommendedFor: "Users with 8GB or 16GB RAM seeking deep multilingual transcription",
    quantization: "q5_0 Quantized",
    languages: "99 Languages",
    fileName: "ggml-medium-q5_0.bin",
  },
  {
    id: "large-v3-turbo-q5_0",
    name: "Large v3 Turbo (q5_0)",
    tier: "Pro",
    badge: "State of the Art",
    size: "574 MB",
    latency: "180 ms",
    ramUsage: "1.1 GB",
    accuracy: 99.7,
    description:
      "Latest turbo architecture unlocking maximum precision across complex vocabulary, technical terms, and heavy accents with DirectML acceleration.",
    recommendedFor: "Medical, legal, engineering architecture, specialized vocabulary, 99 languages",
    quantization: "q5_0 Quantized",
    languages: "99 Languages",
    fileName: "ggml-large-v3-turbo-q5_0.bin",
    popular: true,
  },
  {
    id: "large-v3-turbo-q8_0",
    name: "Large v3 Turbo (q8_0)",
    tier: "Pro",
    badge: "Maximum Precision",
    size: "874 MB",
    latency: "210 ms",
    ramUsage: "1.6 GB",
    accuracy: 99.9,
    description:
      "Near-unquantized 8-bit precision for zero-compromise multilingual translation and highest fidelity across subtle accents.",
    recommendedFor: "Highest fidelity across subtle accents, multi-speaker audio, and technical jargon",
    quantization: "q8_0 Quantized",
    languages: "99 Languages",
    fileName: "ggml-large-v3-turbo-q8_0.bin",
    popular: true,
  },
  {
    id: "distil-small.en",
    name: "Distil-Whisper Small",
    tier: "Distilled",
    badge: "6x Faster Speed",
    size: "336 MB",
    latency: "100 ms",
    ramUsage: "450 MB",
    accuracy: 98.0,
    description:
      "Distilled English Small model. Up to 6x faster inference than standard Whisper Small with minimal memory overhead.",
    recommendedFor: "Ultra-responsive everyday English dictation, chat, rapid coding commands",
    quantization: "Distilled Weights",
    languages: "English Only",
    fileName: "ggml-distil-small.en.bin",
    popular: true,
  },
  {
    id: "distil-large-v3",
    name: "Distil-Whisper Large v3",
    tier: "Distilled",
    badge: "Peak Speed & Quality",
    size: "1.52 GB",
    latency: "180 ms",
    ramUsage: "1.8 GB",
    accuracy: 99.5,
    description:
      "Large v3 knowledge distilled into a fast runtime. Delivers studio-level punctuation at 6x the throughput of standard Large v3.",
    recommendedFor: "Power users wanting Large v3 quality at 6x the transcription speed",
    quantization: "Distilled Weights",
    languages: "English Only",
    fileName: "ggml-distil-large-v3.bin",
    popular: true,
  },
];

type FilterCategory = "All" | "Popular" | "Lightweight" | "Balanced" | "Pro" | "Distilled";

export function ModelSelectorGuide() {
  const [selectedModelId, setSelectedModelId] = useState<string>("small-q5_1");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");

  const filteredModels = useMemo(() => {
    if (activeCategory === "Popular") {
      return MODELS.filter((m) => m.popular || m.isDefault);
    }
    if (activeCategory === "All") {
      return MODELS;
    }
    return MODELS.filter((m) => m.tier === activeCategory);
  }, [activeCategory]);

  const selectedModel = useMemo(() => {
    return MODELS.find((m) => m.id === selectedModelId) || MODELS[2]; // fallback to small-q5_1
  }, [selectedModelId]);

  return (
    <section
      id="models"
      className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-neutral-800">
              Offline Model Architecture
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Select the right model for your device.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            HushWrite runs 100% locally with verified Whisper GGML binaries. Whisper Small (190 MB) is included free by default; download or switch to any model with one click.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none no-scrollbar">
          {(["All", "Popular", "Lightweight", "Balanced", "Pro", "Distilled"] as FilterCategory[]).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-sm font-semibold"
                    : "bg-neutral-100/80 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/80"
                }`}
              >
                {cat === "Distilled" ? "Distil-Whisper" : cat}
              </button>
            );
          })}
        </div>

        {/* Model Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
          {filteredModels.map((model) => {
            const isSelected = selectedModel.id === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#141416] text-white font-semibold border-[#141416] shadow-md scale-[1.01] ring-2 ring-neutral-900/20"
                    : "bg-white text-neutral-700 border-neutral-200/80 hover:text-neutral-950 hover:bg-neutral-50 hover:border-neutral-300 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold truncate block">{model.name}</span>
                  {model.isDefault && (
                    <span className={`text-[9px] font-mono px-1 rounded uppercase tracking-wider font-bold shrink-0 ${
                      isSelected ? "bg-emerald-400/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className={isSelected ? "text-neutral-300" : "text-neutral-500"}>
                    {model.size}
                  </span>
                  <span className={isSelected ? "text-neutral-400" : "text-neutral-400"}>
                    {model.latency}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Model Details Panel */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-950">{selectedModel.name}</h3>
                {selectedModel.badge && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {selectedModel.badge}
                  </span>
                )}
                {selectedModel.isDefault && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-semibold">
                    Built-in Default
                  </span>
                )}
              </div>

              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-5">
                {selectedModel.description}
              </p>

              {/* Hardware & Use-Case Card */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs mb-4">
                <span className="font-bold text-neutral-900 block mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Optimal Hardware & Use-Case:
                </span>
                <span className="text-neutral-600 leading-relaxed">{selectedModel.recommendedFor}</span>
              </div>

              {/* Technical Specifications Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-neutral-600">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-100/60 border border-neutral-200/60">
                  <Languages className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">{selectedModel.languages}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-100/60 border border-neutral-200/60">
                  <Cpu className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">{selectedModel.quantization}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-100/60 border border-neutral-200/60 col-span-2 sm:col-span-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Air-Gap / Offline OK</span>
                </div>
              </div>
            </div>

            {/* Metrics HUD */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center justify-between text-neutral-500 text-[10px] uppercase mb-1">
                  <span>Latency</span>
                  <Zap className="w-3 h-3 text-amber-500" />
                </div>
                <span className="font-bold text-neutral-950 text-base">
                  {selectedModel.latency}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">typical inference</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center justify-between text-neutral-500 text-[10px] uppercase mb-1">
                  <span>Disk Size</span>
                  <HardDrive className="w-3 h-3 text-blue-500" />
                </div>
                <span className="font-bold text-neutral-950 text-base">{selectedModel.size}</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5 truncate">{selectedModel.fileName}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center justify-between text-neutral-500 text-[10px] uppercase mb-1">
                  <span>RAM Usage</span>
                  <Cpu className="w-3 h-3 text-purple-500" />
                </div>
                <span className="font-bold text-neutral-950 text-base">
                  {selectedModel.ramUsage}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">active memory</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/90">
                <div className="flex items-center justify-between text-emerald-700 text-[10px] uppercase font-bold mb-1">
                  <span>Accuracy</span>
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="font-bold text-emerald-700 text-base">
                  {selectedModel.accuracy}%
                </span>
                <span className="text-[10px] text-emerald-600/80 block mt-0.5">benchmark score</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
