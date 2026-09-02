"use client";

import Link from "next/link";
import { Mark } from "./Mark";
import { GithubIcon } from "./GithubIcon";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#313131] bg-[#000000] pt-16 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#313131]">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-[#181818] border border-[#313131]">
                <Mark size="sm" animated={true} />
              </div>
              <span className="font-bold text-base text-white">Murmur</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
              Local AI speech to text for macOS and Windows. Free forever, open source, zero cloud latency, and no audio ever leaves your computer.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181818] text-white/80 border border-[#313131] text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Whisper Engine: Ready
              </span>
              <span className="text-[11px] font-mono text-white/40">
                MIT Licensed
              </span>
            </div>
          </div>

          {/* Product Links (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-2 text-xs">
            <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px] mb-1">
              Product
            </span>
            <Link href="/#features" className="text-white/60 hover:text-white transition-colors">
              Jobs & Features
            </Link>
            <Link href="/blog" className="text-white/60 hover:text-white transition-colors">
              Blog & Guides
            </Link>
            <Link href="/#comparison" className="text-white/60 hover:text-white transition-colors">
              Cloud vs Local
            </Link>
            <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Privacy Architecture
            </Link>
            <Link href="/pricing" className="text-white/60 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/#download" className="text-white/60 hover:text-white transition-colors">
              Download
            </Link>
          </div>

          {/* Architecture (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-2 text-xs">
            <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px] mb-1">
              Stack
            </span>
            <a
              href="https://github.com/webprodigies/murmur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              Rust Backend
            </a>
            <a
              href="https://github.com/webprodigies/murmur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              Tauri 2 Framework
            </a>
            <a
              href="https://github.com/ggerganov/whisper.cpp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              whisper.cpp
            </a>
            <a
              href="https://github.com/webprodigies/murmur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              DirectML and Metal
            </a>
          </div>

          {/* Open Source & Legal (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-2 text-xs">
            <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px] mb-1">
              Open Source
            </span>
            <a
              href="https://github.com/webprodigies/murmur"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="https://github.com/webprodigies/murmur/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              Releases and Changelog
            </a>
            <a
              href="https://github.com/webprodigies/murmur/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              MIT License
            </a>
            <a
              href="https://github.com/webprodigies/murmur/blob/main/PRIVACY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 font-mono">
          <span>Murmur Open Source Project · 100% On Device</span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Shortcut:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#181818] border border-[#313131] text-white/70 text-[10px]">
                Option Space
              </kbd>
            </div>

            <button
              onClick={scrollToTop}
              className="px-2 py-1 rounded bg-[#181818] hover:bg-[#272727] text-white/70 hover:text-white transition-colors"
            >
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
