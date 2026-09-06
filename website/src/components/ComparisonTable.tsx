"use client";

import { Check, X, ShieldCheck } from "lucide-react";

interface ComparisonRow {
  feature: string;
  murmur: string | boolean;
  wisprFlow: string | boolean;
  superwhisper: string | boolean;
  builtIn: string | boolean;
}

const COMPARISONS: ComparisonRow[] = [
  {
    feature: "Architecture & Data Boundary",
    murmur: "100% On-Device (Zero cloud upload)",
    wisprFlow: "Cloud transcription (Audio uploaded)",
    superwhisper: "Hybrid (Cloud for advanced)",
    builtIn: "Cloud-dependent",
  },
  {
    feature: "Privacy Guarantee Mechanism",
    murmur: "Physical architecture (Zero bytes sent)",
    wisprFlow: "Policy & settings based",
    superwhisper: "Policy based",
    builtIn: "Terms of service",
  },
  {
    feature: "Offline Dictation (Planes & Travel)",
    murmur: true,
    wisprFlow: false,
    superwhisper: true,
    builtIn: false,
  },
  {
    feature: "Universal Global Hotkey (Any App)",
    murmur: true,
    wisprFlow: true,
    superwhisper: true,
    builtIn: true,
  },
  {
    feature: "Filler Word Stripping & Punctuation",
    murmur: "Instant local formatting",
    wisprFlow: "Cloud LLM",
    superwhisper: "Local / Cloud",
    builtIn: "Basic raw text",
  },
  {
    feature: "Custom Jargon & Phonetic Biasing",
    murmur: "Unlimited on-device dictionary",
    wisprFlow: "Cloud managed",
    superwhisper: "Pro tier only",
    builtIn: "None",
  },
  {
    feature: "macOS & Windows Parity",
    murmur: "Native macOS & Windows (Metal / DirectML)",
    wisprFlow: "macOS & Windows preview",
    superwhisper: "macOS only",
    builtIn: "OS locked",
  },
  {
    feature: "Latency",
    murmur: "Under 180 ms (Local GPU)",
    wisprFlow: "300 to 700 ms (Network ping)",
    superwhisper: "250 ms",
    builtIn: "500 ms+",
  },
  {
    feature: "Pricing & License",
    murmur: "Free & Open Source (MIT)",
    wisprFlow: "$144 / year subscription",
    superwhisper: "$200 lifetime",
    builtIn: "Free basic",
  },
];

export function ComparisonTable() {
  const renderCell = (val: string | boolean, isMurmur = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${isMurmur ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-neutral-100 text-neutral-700 border border-neutral-200/80"}`}
        >
          <Check className="w-3 h-3 stroke-[2.5]" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 text-neutral-400 border border-neutral-200/80">
          <X className="w-3 h-3 stroke-[2]" />
        </span>
      );
    }

    return (
      <span
        className={`text-xs font-mono font-medium ${
          isMurmur ? "text-neutral-950 font-bold" : "text-neutral-600"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section
      id="comparison"
      className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-800">
              Architecture vs. Policy
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Cloud dictation vs. Local dictation.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Cloud tools protect data with privacy policies. Murmur protects data by keeping your
            dictation on your device in the first place.
          </p>
        </div>

        {/* Contrast Banner Callout */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 mb-8 text-center max-w-2xl mx-auto shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-700 font-mono leading-relaxed">
            <span className="text-emerald-700 font-bold">The Local-First Difference:</span> You
            don&apos;t have to trade speed, usability, or smart formatting to get complete
            air-gapped privacy.
          </p>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl bg-white border border-neutral-200/90 overflow-x-auto shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/80">
                <th className="p-4 sm:p-5 text-xs font-semibold text-neutral-900 w-2/5">
                  Capability
                </th>
                <th className="p-4 sm:p-5 text-center w-1/5 bg-emerald-50/50 border-x border-emerald-200/80">
                  <span className="text-xs font-bold text-neutral-950 block">Murmur</span>
                  <span className="text-[10px] font-mono text-emerald-700 block font-semibold">
                    Local-First (Free MIT)
                  </span>
                </th>
                <th className="p-4 sm:p-5 text-center text-xs font-semibold text-neutral-600 w-1/5">
                  Wispr Flow
                </th>
                <th className="p-4 sm:p-5 text-center text-xs font-semibold text-neutral-600 w-1/5">
                  Superwhisper
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/80 text-xs">
              {COMPARISONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="p-4 font-medium text-neutral-800">{row.feature}</td>
                  <td className="p-4 text-center bg-emerald-50/20 border-x border-emerald-200/60">
                    {renderCell(row.murmur, true)}
                  </td>
                  <td className="p-4 text-center text-neutral-600">{renderCell(row.wisprFlow)}</td>
                  <td className="p-4 text-center text-neutral-600">
                    {renderCell(row.superwhisper)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
