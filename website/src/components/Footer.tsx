"use client";

import Link from "next/link";
import { Mark } from "./Mark";
import { GithubIcon } from "./GithubIcon";
import { ArrowUp, ShieldCheck, Terminal, Cpu } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/[0.08] bg-[#050505] pt-16 pb-12 overflow-hidden">
      {/* Subtle ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner">
                <Mark size="sm" animated={true} />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-tight">Murmur</span>
                <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  v0.8.4-local
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              Local AI speech to text for macOS and Windows. Free forever, open source, zero cloud latency, and no audio or transcript ever leaves your device.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] text-neutral-300 border border-white/[0.08] text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span>Engine: 100% Offline Ready</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] text-neutral-400 border border-white/[0.06] text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                MIT License
              </span>
            </div>
          </div>

          {/* Product Links (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-2.5 text-sm">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
              Product
            </span>
            <Link href="/developers" className="text-neutral-400 hover:text-white transition-colors">
              Developers & IDEs
            </Link>
            <Link href="/creators" className="text-neutral-400 hover:text-white transition-colors">
              Content Creators
            </Link>
            <Link href="/#features" className="text-neutral-400 hover:text-white transition-colors">
              Features & Modes
            </Link>
            <Link href="/#playground" className="text-neutral-400 hover:text-white transition-colors">
              Voice Lab
            </Link>
            <Link href="/#comparison" className="text-neutral-400 hover:text-white transition-colors">
              Cloud vs Local
            </Link>
            <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Privacy Promise
            </Link>
            <Link href="/pricing" className="text-neutral-400 hover:text-white transition-colors">
              Free vs Pro
            </Link>
            <Link href="/#download" className="text-neutral-400 hover:text-white transition-colors">
              Download App
            </Link>
          </div>

          {/* Stack & Architecture (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-2.5 text-sm">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-emerald-400" />
              Stack
            </span>
            <a
              href="https://github.com/webprodigies/murmur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Rust Backend
            </a>
            <a
              href="https://github.com/webprodigies/murmur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Tauri 2 Core
            </a>
            <a
              href="https://github.com/ggerganov/whisper.cpp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              whisper.cpp
            </a>
            <a
              href="https://github.com/webprodigies/murmur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              DirectML & Metal
            </a>
          </div>

          {/* Open Source & Community (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-2.5 text-sm">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-emerald-400" />
              Ecosystem
            </span>
            <a
              href="https://github.com/webprodigies/murmur"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
            >
              <GithubIcon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="https://github.com/webprodigies/murmur/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Releases & Changelog
            </a>
            <a
              href="https://github.com/webprodigies/murmur/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Open Source (MIT)
            </a>
            <a
              href="https://github.com/webprodigies/murmur/blob/main/PRIVACY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
            <span>Murmur Project · Zero telemetry · 100% on-device</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] px-3 py-1 rounded-full">
              <span className="text-neutral-400">Shortcut:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-neutral-300 text-[10px] font-sans font-medium">
                ⌥ Space / Ctrl+Space
              </kbd>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] transition-all"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
