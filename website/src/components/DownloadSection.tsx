/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Download, Terminal, Check, Copy, Laptop, ShieldCheck, Cpu, HardDrive } from "lucide-react";

export function DownloadSection() {
  const [detectedOs, setDetectedOs] = useState<"mac" | "windows" | "linux">("mac");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) setDetectedOs("windows");
      else if (ua.includes("mac")) setDetectedOs("mac");
      else setDetectedOs("linux");
    }
  }, []);

  const copyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const cliCommands = [
    {
      platform: "macOS Homebrew",
      command: "brew install --cask murmur",
    },
    {
      platform: "Windows Winget",
      command: "winget install WebProdigies.Murmur",
    },
    {
      platform: "Linux Shell Script",
      command: "curl -fsSL https://get.murmur.app | bash",
    },
  ];

  return (
    <section id="download" className="py-24 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
              Ready to Dictate
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Download Murmur. Free forever.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            No credit card, account, or cloud telemetry required. Installs and runs in under 60 seconds.
          </p>
        </div>

        {/* Primary Download Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* macOS Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] flex flex-col justify-between shadow-[0_16px_48px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {detectedOs === "mac" && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-bold text-white">macOS</h3>
                </div>
                {detectedOs === "mac" && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    Detected Device
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-zinc-400 block mb-3">
                macOS 13.0 or later (Apple Silicon & Intel)
              </span>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                Native Metal GPU acceleration on Apple Silicon (M1, M2, M3, M4) and Intel Macs. Runs quietly in your menu bar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs sm:text-sm font-semibold text-black bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Apple Silicon (.dmg)
              </a>
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] py-3 px-4 rounded-xl transition-all"
              >
                Intel Mac (.dmg)
              </a>
            </div>
          </div>

          {/* Windows Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] flex flex-col justify-between shadow-[0_16px_48px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {detectedOs === "windows" && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-bold text-white">Windows</h3>
                </div>
                {detectedOs === "windows" && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    Detected Device
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-zinc-400 block mb-3">
                Windows 10 & 11 (64-bit)
              </span>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                Native DirectML & CUDA acceleration for NVIDIA, AMD, and Intel GPUs. Operates seamlessly in your system tray.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs sm:text-sm font-semibold text-black bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Windows Installer (.exe)
              </a>
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] py-3 px-4 rounded-xl transition-all"
              >
                MSIX Bundle
              </a>
            </div>
          </div>
        </div>

        {/* Terminal Package Manager Quickstart */}
        <div className="p-6 rounded-2xl bg-[#0e0e11]/90 backdrop-blur-2xl border border-white/[0.08] mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Install via Command Line Package Managers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between gap-2.5"
              >
                <span className="text-[11px] font-mono text-zinc-400">
                  {item.platform}
                </span>
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-zinc-200 bg-[#060608] p-2.5 rounded-lg border border-white/[0.06]">
                  <span className="truncate">{item.command}</span>
                  <button
                    onClick={() => copyCommand(item.command, idx)}
                    className="p-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-all shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements & Verification Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block mb-0.5">Disk Space</span>
              <span className="text-zinc-500">600 MB for default Whisper Small model</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block mb-0.5">GPU Acceleration</span>
              <span className="text-zinc-500">Apple Silicon Metal & Windows DirectML</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block mb-0.5">Privacy Verified</span>
              <span className="text-zinc-500">Zero network egress · 100% On-Device</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
