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
    <section id="download" className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-800">
              Ready to Dictate
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Download Murmur. Free forever.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            No credit card, account, or cloud telemetry required. Installs and runs in under 60 seconds.
          </p>
        </div>

        {/* Primary Download Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* macOS Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 flex flex-col justify-between shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
            {detectedOs === "mac" && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-neutral-900" />
                  <h3 className="text-xl font-bold text-neutral-950">macOS</h3>
                </div>
                {detectedOs === "mac" && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold">
                    Detected Device
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-neutral-500 block mb-3">
                macOS 13.0 or later (Apple Silicon & Intel)
              </span>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6">
                Native Metal GPU acceleration on Apple Silicon (M1, M2, M3, M4) and Intel Macs. Runs quietly in your menu bar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs sm:text-sm font-semibold text-white bg-[#141416] hover:bg-neutral-800 py-3.5 px-4 rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                Apple Silicon (.dmg)
              </a>
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs sm:text-sm font-semibold text-neutral-800 hover:bg-neutral-50 bg-white border border-neutral-200/90 py-3.5 px-4 rounded-xl transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                Intel Mac (.dmg)
              </a>
            </div>
          </div>

          {/* Windows Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 flex flex-col justify-between shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
            {detectedOs === "windows" && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-neutral-900" />
                  <h3 className="text-xl font-bold text-neutral-950">Windows</h3>
                </div>
                {detectedOs === "windows" && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold">
                    Detected Device
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-neutral-500 block mb-3">
                Windows 10 & 11 (64-bit)
              </span>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6">
                Native DirectML & CUDA acceleration for NVIDIA, AMD, and Intel GPUs. Operates seamlessly in your system tray.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs sm:text-sm font-semibold text-white bg-[#141416] hover:bg-neutral-800 py-3.5 px-4 rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                Windows Installer (.exe)
              </a>
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs sm:text-sm font-semibold text-neutral-800 hover:bg-neutral-50 bg-white border border-neutral-200/90 py-3.5 px-4 rounded-xl transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                MSIX Bundle
              </a>
            </div>
          </div>
        </div>

        {/* Terminal Package Manager Quickstart */}
        <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-3.5 h-3.5 text-emerald-700" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
              Install via Command Line Package Managers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-sm flex flex-col justify-between gap-2.5"
              >
                <span className="text-[11px] font-mono text-neutral-500">
                  {item.platform}
                </span>
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-neutral-900 bg-neutral-100/80 p-2.5 rounded-lg border border-neutral-200/80">
                  <span className="truncate">{item.command}</span>
                  <button
                    onClick={() => copyCommand(item.command, idx)}
                    className="p-1.5 rounded-md bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/80 shadow-sm transition-all shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-3">
            <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-neutral-900 block mb-0.5">Disk Space</span>
              <span className="text-neutral-500">600 MB for default Whisper Small model</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-3">
            <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-neutral-900 block mb-0.5">GPU Acceleration</span>
              <span className="text-neutral-500">Apple Silicon Metal & Windows DirectML</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-neutral-900 block mb-0.5">Privacy Verified</span>
              <span className="text-neutral-500">Zero network egress · 100% On-Device</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
