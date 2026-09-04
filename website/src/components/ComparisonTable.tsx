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
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${isMurmur ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-white/[0.06] text-zinc-400"}`}>
          <Check className="w-3 h-3 stroke-[2.5]" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-400/60 border border-red-500/20">
          <X className="w-3 h-3 stroke-[2]" />
        </span>
      );
    }

    return (
      <span
        className={`text-xs font-mono font-medium ${
          isMurmur ? "text-white font-bold" : "text-zinc-400"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section id="comparison" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Architecture vs. Policy
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Cloud dictation vs. Local dictation.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Cloud tools protect data with privacy policies. Murmur protects data by keeping your dictation on your device in the first place.
          </p>
        </div>

        {/* Contrast Banner Callout */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-8 text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-zinc-300 font-mono leading-relaxed">
            <span className="text-emerald-400 font-bold">The Local-First Difference:</span> You don&apos;t have to trade speed, usability, or smart formatting to get complete air-gapped privacy.
          </p>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] overflow-x-auto shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="p-4 sm:p-5 text-xs font-semibold text-zinc-300 w-2/5">
                  Capability
                </th>
                <th className="p-4 sm:p-5 text-center w-1/5 bg-emerald-500/[0.06] border-x border-emerald-500/20">
                  <span className="text-xs font-bold text-white block">
                    Murmur
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                    Local-First (Free MIT)
                  </span>
                </th>
                <th className="p-4 sm:p-5 text-center text-xs font-semibold text-zinc-400 w-1/5">
                  Wispr Flow
                </th>
                <th className="p-4 sm:p-5 text-center text-xs font-semibold text-zinc-400 w-1/5">
                  Superwhisper
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {COMPARISONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-zinc-200">
                    {row.feature}
                  </td>
                  <td className="p-4 text-center bg-emerald-500/[0.03] border-x border-emerald-500/20">
                    {renderCell(row.murmur, true)}
                  </td>
                  <td className="p-4 text-center text-zinc-400">
                    {renderCell(row.wisprFlow)}
                  </td>
                  <td className="p-4 text-center text-zinc-400">
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
