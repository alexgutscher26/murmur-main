"use client";

import { useState, useEffect } from "react";

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
    <section id="download" className="py-24 bg-[#000000] border-t border-[#313131]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/50 block mb-2">
            Ready to Dictate
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Download Murmur. Free forever.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            No credit card or account required. Installs in under 60 seconds.
          </p>
        </div>

        {/* Primary Download Platform Cards (B3: Nested radius) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* macOS Card */}
          <div className="p-6 rounded-2xl bg-[#181818] border border-[#313131] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">macOS</h3>
                {detectedOs === "mac" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#272727] text-white/80 border border-[#313131]">
                    Your device
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-white/50 block mb-3">
                macOS 13.0 or later (Apple Silicon and Intel)
              </span>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-6">
                Native Metal GPU acceleration on Apple Silicon (M1, M2, M3, M4) and Intel Macs. Runs in your menu bar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm font-semibold text-black bg-white hover:bg-white/90 py-2.5 px-3 rounded-lg transition-colors"
              >
                Apple Silicon (.dmg)
              </a>
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm font-semibold text-white bg-[#1f1f1f] hover:bg-[#272727] border border-[#313131] py-2.5 px-3 rounded-lg transition-colors"
              >
                Intel Mac (.dmg)
              </a>
            </div>
          </div>

          {/* Windows Card */}
          <div className="p-6 rounded-2xl bg-[#181818] border border-[#313131] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">Windows</h3>
                {detectedOs === "windows" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#272727] text-white/80 border border-[#313131]">
                    Your device
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-white/50 block mb-3">
                Windows 10 and 11 (64 bit)
              </span>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-6">
                Native DirectML and CUDA acceleration for NVIDIA, AMD, and Intel GPUs. Operates in system tray.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm font-semibold text-black bg-white hover:bg-white/90 py-2.5 px-3 rounded-lg transition-colors"
              >
                Windows Installer (.exe)
              </a>
              <a
                href="https://github.com/webprodigies/murmur/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm font-semibold text-white bg-[#1f1f1f] hover:bg-[#272727] border border-[#313131] py-2.5 px-3 rounded-lg transition-colors"
              >
                MSIX Bundle
              </a>
            </div>
          </div>
        </div>

        {/* Terminal Package Manager Quickstart */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#181818] border border-[#313131] mb-8">
          <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider font-mono">
            Install via package managers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131] flex flex-col justify-between gap-2"
              >
                <span className="text-[11px] font-mono text-white/50">
                  {item.platform}
                </span>
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-white/90 bg-[#131209] p-2 rounded border border-[#313131]">
                  <span className="truncate">{item.command}</span>
                  <button
                    onClick={() => copyCommand(item.command, idx)}
                    className="px-2 py-0.5 text-[10px] rounded bg-[#272727] hover:bg-[#313131] text-white/80 transition-colors shrink-0"
                  >
                    {copiedIndex === idx ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements & Verification Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/70">
          <div className="p-3 rounded-lg bg-[#181818] border border-[#313131]">
            <span className="font-semibold text-white block mb-0.5">Disk space</span>
            <span className="text-white/50">600 MB for default Whisper Small</span>
          </div>

          <div className="p-3 rounded-lg bg-[#181818] border border-[#313131]">
            <span className="font-semibold text-white block mb-0.5">Hardware acceleration</span>
            <span className="text-white/50">Metal on macOS and DirectML on Windows</span>
          </div>

          <div className="p-3 rounded-lg bg-[#181818] border border-[#313131]">
            <span className="font-semibold text-white block mb-0.5">Privacy guarantee</span>
            <span className="text-white/50">Zero audio leaves your computer</span>
          </div>
        </div>
      </div>
    </section>
  );
}
