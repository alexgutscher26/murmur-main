"use client";

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
    murmur: "100% on-device (Zero cloud upload)",
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
    murmur: "Under 200 ms (Local GPU)",
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
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${isMurmur ? "bg-emerald-400" : "bg-white/40"}`} />
      ) : (
        <span className="text-xs font-mono text-white/30">✕</span>
      );
    }

    return (
      <span
        className={`text-xs font-mono font-medium ${
          isMurmur ? "text-white font-bold" : "text-white/60"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section id="comparison" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 block mb-2">
            Architecture vs. Policy
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Cloud dictation vs. Local dictation.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Cloud tools protect data with policies and controls. We protect it by keeping your dictation on your device in the first place.
          </p>
        </div>

        {/* Contrast Banner Callout */}
        <div className="p-4 rounded-xl bg-[#141414] border border-[#272727] mb-8 text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-white/80 font-mono leading-relaxed">
            <span className="text-emerald-400 font-semibold">The Local-First Difference:</span> You don&apos;t have to trade usability, speed, or app-ready formatting to get complete air-gapped privacy.
          </p>
        </div>

        {/* Table Container (B4: Flat table with full borders) */}
        <div className="rounded-2xl bg-[#181818] border border-[#313131] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[#313131] bg-[#1f1f1f]">
                <th className="p-4 sm:p-5 text-xs font-semibold text-white/80 w-2/5">
                  Capability
                </th>
                <th className="p-4 sm:p-5 text-center w-1/5 bg-[#222222] border-x border-[#313131]">
                  <span className="text-xs font-bold text-white block">
                    Murmur
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 block">
                    Local-First (Free MIT)
                  </span>
                </th>
                <th className="p-4 sm:p-5 text-center text-xs font-semibold text-white/60 w-1/5">
                  Wispr Flow
                </th>
                <th className="p-4 sm:p-5 text-center text-xs font-semibold text-white/60 w-1/5">
                  Superwhisper
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#313131] text-xs">
              {COMPARISONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1f1f1f] transition-colors">
                  <td className="p-4 font-medium text-white/90">
                    {row.feature}
                  </td>
                  <td className="p-4 text-center bg-[#181818] border-x border-[#313131]">
                    {renderCell(row.murmur, true)}
                  </td>
                  <td className="p-4 text-center text-white/60">
                    {renderCell(row.wisprFlow)}
                  </td>
                  <td className="p-4 text-center text-white/60">
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
