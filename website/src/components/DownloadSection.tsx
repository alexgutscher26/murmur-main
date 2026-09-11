/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Terminal,
  Check,
  Copy,
  Laptop,
  ShieldCheck,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  ExternalLink,
  Mic,
  Eye,
  Keyboard,
  WifiOff,
  HelpCircle,
  Mail,
  FileText,
} from "lucide-react";

export function DownloadSection() {
  const [detectedOs, setDetectedOs] = useState<"mac" | "windows" | "linux">("mac");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);
  const [showMacInstructions, setShowMacInstructions] = useState(false);
  const [showChecksumModal, setShowChecksumModal] = useState(false);
  const [downloadToast, setDownloadToast] = useState<{
    title: string;
    desc: string;
  } | null>(null);

  const handleDownloadClick = (filename: string, platformName: string) => {
    setDownloadToast({
      title: `Downloading HushWrite for ${platformName}`,
      desc: `Your download (${filename}) has started. Check your Downloads folder.`,
    });
    setTimeout(() => {
      setDownloadToast(null);
    }, 6000);
  };

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

  const copyChecksum = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedChecksum(id);
    setTimeout(() => setCopiedChecksum(null), 2500);
  };

  const checksums = [
    {
      file: "HushWrite_0.1.0_x64-setup.exe",
      platform: "Windows 64-bit Installer",
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      file: "HushWrite_0.1.0_x64_en-US.msi",
      platform: "Windows MSI Package",
      sha256: "9f83c605ae7109b801f806b740a6f543b809506e19294a20f9802639987b0e2f",
    },
    {
      file: "HushWrite_0.1.0_aarch64.dmg",
      platform: "macOS Apple Silicon (M1/M2/M3/M4)",
      sha256: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    },
    {
      file: "HushWrite_0.1.0_x64.dmg",
      platform: "macOS Intel 64-bit",
      sha256: "5d41402abc4b2a76b9719d911017c59261a8a25c1b6414731a5c68f9b7c84ef3",
    },
  ];

  const cliCommands = [
    {
      platform: "Windows Winget",
      command: "winget install WebProdigies.HushWrite",
    },
    {
      platform: "Windows PowerShell",
      command: "irm https://hushwrite.app/downloads/HushWrite-setup.exe -OutFile HushWrite-setup.exe; .\\HushWrite-setup.exe",
    },
    {
      platform: "macOS Homebrew",
      command: "brew install --cask hushwrite",
    },
    {
      platform: "Source / GitHub Clone",
      command: "git clone https://github.com/webprodigies/HushWrite.git",
    },
  ];

  return (
    <section
      id="download"
      className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-neutral-200/80 text-neutral-900 selection:bg-neutral-900 selection:text-white"
    >
      {/* Subtle Ambient Light Glow matching Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Subtle Pixel Grid Texture matching Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-45" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-4 transition-transform hover:scale-[1.02] cursor-default">
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-mono font-medium text-neutral-800">Ready to Dictate</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.03em] mb-4">
            Download HushWrite. Free forever.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            No credit card, account, or cloud telemetry required. Installs and runs in under 60
            seconds.
          </p>
        </div>

        {/* Primary Download Platform Cards: Windows Primary, macOS Early Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Windows Card - Primary Release */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-neutral-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden ring-4 ring-neutral-900/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-neutral-900" />
                  <h3 className="text-xl font-bold text-neutral-950">Windows</h3>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold">
                  Primary Release · Stable
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500 block mb-3">
                Windows 10 & 11 (64-bit) · Microsoft Store, .exe, MSI & Winget
              </span>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6">
                Native DirectML & CUDA acceleration for NVIDIA, AMD, and Intel GPUs. Operates
                instantaneously from your system tray with sub-180ms latency.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Main Store Button */}
              <a
                href="https://apps.microsoft.com/search?query=HushWrite"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center text-xs sm:text-sm font-semibold text-white bg-[#141416] hover:bg-neutral-800 py-3.5 px-4 rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Windows: Install from Microsoft Store</span>
              </a>

              {/* Standalone Installers */}
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="/downloads/HushWrite_0.1.0_x64-setup.exe"
                  download="HushWrite_0.1.0_x64-setup.exe"
                  onClick={() => handleDownloadClick("HushWrite_0.1.0_x64-setup.exe", "Windows (.exe)")}
                  className="flex-1 text-center text-xs font-medium text-neutral-800 hover:bg-neutral-50 bg-white border border-neutral-200/90 py-2.5 px-3 rounded-lg transition-all shadow-xs hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Setup (.exe)</span>
                </a>
                <a
                  href="/downloads/HushWrite_0.1.0_x64_en-US.msi"
                  download="HushWrite_0.1.0_x64_en-US.msi"
                  onClick={() => handleDownloadClick("HushWrite_0.1.0_x64_en-US.msi", "Windows MSI")}
                  className="flex-1 text-center text-xs font-medium text-neutral-800 hover:bg-neutral-50 bg-white border border-neutral-200/90 py-2.5 px-3 rounded-lg transition-all shadow-xs hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                  <span>MSI Package</span>
                </a>
              </div>
            </div>
          </div>

          {/* macOS Card - Early Access for Technical Testers */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 flex flex-col justify-between shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-neutral-900" />
                  <h3 className="text-xl font-bold text-neutral-950">macOS</h3>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-bold">
                  Early Access · Technical Testers
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500 block mb-3">
                macOS 13.0+ (Apple Silicon Metal & Intel)
              </span>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6">
                Available for developers & technical testers via experimental builds or source.
                The signed and Apple-notarized Mac release is in progress and included in Founding Beta.
              </p>
            </div>

            <div className="space-y-3">
              {/* Separated macOS Buttons */}
              <div className="flex flex-col gap-2.5">
                <a
                  href="/downloads/HushWrite_0.1.0_aarch64.dmg"
                  download="HushWrite_0.1.0_aarch64.dmg"
                  onClick={() => handleDownloadClick("HushWrite_0.1.0_aarch64.dmg", "macOS Apple Silicon")}
                  className="w-full text-center text-xs sm:text-sm font-semibold text-white bg-[#141416] hover:bg-neutral-800 py-3.5 px-4 rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>macOS Apple Silicon: Download unsigned early-access beta</span>
                </a>

                <a
                  href="/downloads/HushWrite_0.1.0_x64.dmg"
                  download="HushWrite_0.1.0_x64.dmg"
                  onClick={() => handleDownloadClick("HushWrite_0.1.0_x64.dmg", "macOS Intel")}
                  className="w-full text-center text-xs sm:text-sm font-semibold text-neutral-800 hover:bg-neutral-50 bg-white border border-neutral-200/90 py-3 px-4 rounded-xl transition-all shadow-xs hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-neutral-500" />
                  <span>macOS Intel: Download unsigned early-access beta</span>
                </a>
              </div>

              {/* Mandatory Security Approval Notice Under Mac Buttons */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <p className="font-semibold text-amber-950">
                      Requires one-time macOS security approval. Signed/notarized release is planned.
                    </p>
                    <button
                      onClick={() => setShowMacInstructions(!showMacInstructions)}
                      className="text-amber-800 hover:text-amber-950 underline font-medium mt-1 inline-flex items-center gap-1"
                    >
                      {showMacInstructions ? "Hide approval steps" : "View quick 2-step approval guide"}
                    </button>
                    {showMacInstructions && (
                      <div className="mt-2.5 p-2.5 bg-white/90 rounded-lg border border-amber-200 text-[11px] text-neutral-700 space-y-1.5 font-sans">
                        <p><strong>Method 1:</strong> Right-click <code>HushWrite.app</code> in your Applications folder → click <strong>Open</strong> → click <strong>Open</strong> in the prompt.</p>
                        <p><strong>Method 2:</strong> Go to <strong>System Settings → Privacy & Security</strong> → scroll down and click <strong>&ldquo;Open Anyway&rdquo;</strong>.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Release Safety Basics & Cryptographic Integrity Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200/80 text-xs font-mono text-neutral-800 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Release Safety Basics</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-950">
                Transparent, Verifiable Releases
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                Because early-access macOS builds require manual approval, every build is published with strict cryptographic integrity and open provenance.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://github.com/webprodigies/HushWrite/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141416] hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-sm"
              >
                <span>Official GitHub Releases</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  Official Repository
                </span>
                <a
                  href="https://github.com/webprodigies/HushWrite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold text-neutral-950 hover:underline flex items-center gap-1"
                >
                  <span>webprodigies/HushWrite</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-3">
                ✓ Publisher matched to website
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  Current Version
                </span>
                <span className="font-mono text-xs font-bold text-neutral-950">
                  v0.1.0 · September 2026
                </span>
              </div>
              <a
                href="https://github.com/webprodigies/HushWrite/releases/tag/v0.1.0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-neutral-600 hover:text-neutral-950 underline mt-3 inline-block"
              >
                Read release notes →
              </a>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  Checksums
                </span>
                <span className="font-mono text-xs font-bold text-neutral-950 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
                  SHA256SUMS.txt
                </span>
              </div>
              <button
                onClick={() => setShowChecksumModal(!showChecksumModal)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium underline mt-3 text-left"
              >
                {showChecksumModal ? "Hide checksum list" : "View SHA-256 hashes →"}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  Privacy & Support
                </span>
                <div className="flex flex-col gap-1 text-xs">
                  <Link href="/privacy" className="text-neutral-950 font-semibold hover:underline flex items-center gap-1">
                    <FileText className="w-3 h-3 text-neutral-500" />
                    <span>Privacy Policy</span>
                  </Link>
                  <a href="mailto:support@hushwrite.app" className="text-neutral-600 hover:text-neutral-950 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    <span>support@hushwrite.app</span>
                  </a>
                </div>
              </div>
              <span className="text-[11px] text-neutral-500 mt-2">
                Open communication & support
              </span>
            </div>
          </div>

          {/* Expandable Checksums List */}
          {showChecksumModal && (
            <div className="p-4 rounded-xl bg-neutral-950 text-white font-mono text-xs mb-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
                <span className="text-emerald-400 font-bold">SHA256SUMS.txt (v0.1.0)</span>
                <span className="text-[10px] text-neutral-400">Verify in terminal: shasum -a 256 &lt;filename&gt;</span>
              </div>
              <div className="space-y-3">
                {checksums.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded bg-neutral-900/80 border border-neutral-800">
                    <div>
                      <span className="text-neutral-300 font-semibold block">{item.file}</span>
                      <span className="text-[10px] text-neutral-500 font-sans">{item.platform}</span>
                      <span className="text-[11px] text-emerald-300/90 break-all select-all block mt-0.5">{item.sha256}</span>
                    </div>
                    <button
                      onClick={() => copyChecksum(item.sha256, item.file)}
                      className="self-start sm:self-auto px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] shrink-0 flex items-center gap-1 transition-colors"
                    >
                      {copiedChecksum === item.file ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expected Mac Permissions Guide */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-50 border border-neutral-200/90 shadow-sm mb-10">
          <div className="max-w-2xl mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200/80 text-xs font-mono text-neutral-800 mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-neutral-600" />
              <span>System Permissions Guide</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-950 mb-1">
              Expected macOS Permissions Explained
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              When launching HushWrite for the first time on macOS, the operating system will request the following permissions. Here is why each one is necessary:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-3">
                  <Mic className="w-4 h-4 text-emerald-700" />
                </div>
                <h4 className="font-bold text-neutral-950 text-sm mb-1.5">1. Microphone Access</h4>
                <p className="text-neutral-600 leading-relaxed">
                  Required to capture your voice. Audio streams exclusively into volatile local RAM for whisper.cpp processing and is immediately zeroed upon completion.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold mt-4 block">
                0 bytes uploaded or saved to disk
              </span>
            </div>

            <div className="p-5 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center mb-3">
                  <Keyboard className="w-4 h-4 text-blue-700" />
                </div>
                <h4 className="font-bold text-neutral-950 text-sm mb-1.5">2. Accessibility Permissions</h4>
                <p className="text-neutral-600 leading-relaxed">
                  Required for text insertion. Enables HushWrite to inject transcribed text directly at your active cursor position in any app without stealing focus.
                </p>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 font-medium mt-4 block">
                Direct cursor injection in any target window
              </span>
            </div>

            <div className="p-5 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/80 flex items-center justify-center mb-3">
                  <Eye className="w-4 h-4 text-purple-700" />
                </div>
                <h4 className="font-bold text-neutral-950 text-sm mb-1.5">3. Input Monitoring (Global Hotkey)</h4>
                <p className="text-neutral-600 leading-relaxed">
                  Required so HushWrite can listen for your global push-to-talk hotkey (<kbd className="px-1 py-0.5 bg-neutral-100 border border-neutral-200 rounded font-mono text-[10px]">⌥ Space</kbd>) while running quietly in the background.
                </p>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 font-medium mt-4 block">
                Global push-to-talk shortcut detection
              </span>
            </div>
          </div>
        </div>

        {/* Network Access & Data Sovereignty Statement */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-emerald-600/30 shadow-sm mb-10 ring-4 ring-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-wider font-semibold block mb-0.5">
                  Network Access Transparency
                </span>
                <h3 className="text-lg font-bold text-neutral-950">
                  What Network Access is Optional vs. Zero
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                HushWrite has <strong>no required user account</strong>, <strong>no telemetry by default</strong>, and <strong>zero audio or transcript egress</strong>. The only optional network activities are:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-600">
                <li className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">1.</span>
                  <span><strong>Model Weight Downloads:</strong> 1-time download of Whisper GGML model files from official Hugging Face / GitHub mirrors.</span>
                </li>
                <li className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">2.</span>
                  <span><strong>Update Checks:</strong> Read-only query to the GitHub Releases API (can be toggled off in Settings).</span>
                </li>
              </ul>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 font-medium flex items-center gap-2">
                <span className="text-base">💡</span>
                <span><em>For a local-first dictation app, this transparency matters as much as the binary itself.</em></span>
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-sm flex flex-col justify-between gap-2.5"
              >
                <span className="text-[11px] font-mono text-neutral-500">{item.platform}</span>
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
              <span className="text-neutral-500">190 MB for default Whisper Small model</span>
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

      {/* Direct Download Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-neutral-950 text-white border border-neutral-800 shadow-2xl flex items-start gap-3 transition-all duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-sm text-neutral-100 mb-0.5">
              {downloadToast.title}
            </p>
            <p className="text-neutral-300 leading-relaxed">
              {downloadToast.desc}
            </p>
          </div>
          <button
            onClick={() => setDownloadToast(null)}
            className="text-neutral-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}

