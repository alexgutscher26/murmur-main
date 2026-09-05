"use client";

import Link from "next/link";
import { Mark } from "./Mark";
import { GithubIcon } from "./GithubIcon";
import { ArrowUp, ShieldCheck, Cpu } from "lucide-react";

const PRODUCT_LINKS = [
  { href: "/developers", label: "Developers & IDEs" },
  { href: "/creators", label: "Content Creators" },
  { href: "/#features", label: "Features & Modes" },
  { href: "/#playground", label: "Voice Lab" },
  { href: "/#comparison", label: "Cloud vs Local" },
  { href: "/privacy", label: "Privacy Promise", accent: true },
  { href: "/pricing", label: "Free vs Pro" },
  { href: "/#download", label: "Download App" },
];

const STACK_LINKS = [
  { href: "https://github.com/webprodigies/murmur", label: "Rust Backend" },
  { href: "https://github.com/webprodigies/murmur", label: "Tauri 2 Core" },
  { href: "https://github.com/ggerganov/whisper.cpp", label: "whisper.cpp" },
  { href: "https://github.com/webprodigies/murmur", label: "DirectML & Metal" },
];

const ECOSYSTEM_LINKS = [
  { href: "https://github.com/webprodigies/murmur", label: "GitHub Repository", icon: true },
  { href: "https://github.com/webprodigies/murmur/releases", label: "Releases & Changelog" },
  { href: "https://github.com/webprodigies/murmur/blob/main/LICENSE", label: "Open Source (MIT)" },
  { href: "https://github.com/webprodigies/murmur/blob/main/PRIVACY.md", label: "Privacy Policy" },
];

// Deterministic bell-curve-shaped bar heights, so the waveform looks like a
// trailing-off audio clip rather than random noise, and stays stable across renders.
const WAVE_BARS = Array.from({ length: 56 }, (_, i) => {
  const center = 27.5;
  const distance = Math.abs(i - center) / center;
  const envelope = 1 - Math.pow(distance, 1.7);
  const wobble = Math.sin(i * 1.3) * 0.18;
  return Math.max(0.14, Math.min(1, envelope + wobble));
});

function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-neutral-400 hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 rounded-sm transition-colors ${className}`}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      aria-label="Site footer"
      className="relative border-t border-white/[0.08] bg-[#050505] pt-14 pb-12 overflow-hidden"
    >
      {/* Signature moment: a waveform trailing off along the top edge, echoing
          the product itself rather than a generic decorative glow. */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-6 flex items-end justify-center gap-[3px] px-4 pointer-events-none"
      >
        {WAVE_BARS.map((h, i) => (
          <span
            key={i}
            className="motion-safe:animate-[murmur-wave_2.8s_ease-in-out_infinite] w-full max-w-[3px] rounded-full bg-gradient-to-t from-emerald-500/50 to-emerald-300/10 origin-bottom"
            style={{
              height: `${h * 100}%`,
              animationDelay: `${i * 0.035}s`,
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes murmur-wave {
          0%,
          100% {
            transform: scaleY(0.45);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner">
                <Mark size="sm" animated />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">Murmur</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  v0.8.4-local
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              Local speech-to-text for macOS and Windows. Free forever, open
              source, and your audio never leaves your device.
            </p>

            <ul className="flex flex-wrap items-center gap-2">
              <li className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] text-neutral-300 border border-white/[0.08] text-xs">
                <span className="relative flex w-2 h-2" aria-hidden="true">
                  <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
                </span>
                Works fully offline
              </li>
              <li className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] text-neutral-400 border border-white/[0.06] text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                MIT License
              </li>
            </ul>
          </div>

          {/* Product */}
          <nav aria-label="Product" className="md:col-span-2 flex flex-col gap-2.5 text-sm">
            <span className="text-neutral-300 font-semibold mb-1">Product</span>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 rounded-sm ${
                      link.accent
                        ? "text-emerald-400 hover:text-emerald-300 font-medium"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Stack */}
          <nav aria-label="Stack" className="md:col-span-2 flex flex-col gap-2.5 text-sm">
            <span className="text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              Stack
            </span>
            <ul className="flex flex-col gap-2.5">
              {STACK_LINKS.map((link) => (
                <li key={link.label}>
                  <ExternalLink href={link.href}>{link.label}</ExternalLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Ecosystem */}
          <nav aria-label="Ecosystem" className="md:col-span-3 flex flex-col gap-2.5 text-sm">
            <span className="text-neutral-300 font-semibold mb-1">Ecosystem</span>
            <ul className="flex flex-col gap-2.5">
              {ECOSYSTEM_LINKS.map((link) => (
                <li key={link.label} className="group">
                  <ExternalLink href={link.href} className="flex items-center gap-2">
                    {link.icon && (
                      <GithubIcon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                    )}
                    <span>{link.label}</span>
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Murmur. Zero telemetry, 100% on-device.</p>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] px-3 py-1 rounded-full">
              <span className="text-neutral-400">Shortcut:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-neutral-300 text-[10px] font-mono font-medium">
                ⌥ Space / Ctrl+Space
              </kbd>
            </div>

            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 transition-colors"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}