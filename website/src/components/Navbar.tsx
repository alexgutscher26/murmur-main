"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mark } from "./Mark";
import { GithubIcon } from "./GithubIcon";
import { ArrowUpRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isSubPage = pathname !== "/";
  const isPricingPage = pathname === "/pricing";
  const isPrivacyPage = pathname === "/privacy";
  const isDevelopersPage = pathname === "/developers";
  const isCreatorsPage = pathname === "/creators";
  const isBlogPage = pathname.startsWith("/blog");

  const navLinks = [
    { id: "features", name: "Features", href: isSubPage ? "/#features" : "#features" },
    { id: "playground", name: "Lab", href: isSubPage ? "/#playground" : "#playground" },
    { id: "benchmarks", name: "Benchmarks", href: isSubPage ? "/#benchmarks" : "#benchmarks" },
    { id: "comparison", name: "Comparison", href: isSubPage ? "/#comparison" : "#comparison" },
    { id: "pricing", name: "Pricing", href: "/pricing" },
    { id: "privacy", name: "Privacy", href: "/privacy" },
    { id: "faq", name: "FAQ", href: isSubPage ? "/#faq" : "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Floating Glass Island */}
      <nav className="mt-5 mx-auto w-full max-w-5xl rounded-full bg-[#0a0a0c]/75 backdrop-blur-2xl border border-white/[0.08] px-3 sm:px-4 py-2 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.1)] pointer-events-auto transition-all duration-500">
        {/* Brand Link */}
        <Link
          href="/"
          className="flex items-center gap-2.5 pl-1.5 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded-full"
        >
          <div className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all duration-300">
            <Mark size="sm" animated={true} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Murmur
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              v0.1.0 · Local AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-full p-1">
          {navLinks.map((link) => {
            const isActive =
              link.id === "developers"
                ? isDevelopersPage
                : link.id === "creators"
                ? isCreatorsPage
                : link.id === "pricing"
                ? isPricingPage
                : link.id === "privacy"
                ? isPrivacyPage
                : link.id === "blog"
                ? isBlogPage
                : false;
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 relative ${
                  isActive
                    ? "text-black bg-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* GitHub Star */}
          <a
            href="https://github.com/webprodigies/murmur"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] px-3 py-1.5 rounded-full transition-all duration-200"
          >
            <GithubIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            <span>GitHub</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.08] text-zinc-300">
              4.8k
            </span>
          </a>

          {/* Primary CTA button */}
          <Link
            href="/#download"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-black bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white px-4 py-2 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Download</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden relative w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            <div className="w-4 h-3.5 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "rotate-45 absolute top-1.5" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "-rotate-45 absolute top-1.5" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Screen-filling Mobile Modal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/85 flex flex-col justify-center px-8 lg:hidden pointer-events-auto"
          >
            <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 * idx }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-semibold text-zinc-300 hover:text-white py-2.5 border-b border-white/[0.06] transition-colors flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex flex-col gap-2.5 mt-6"
              >
                <Link
                  href="/#download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-semibold text-black bg-white py-3 px-4 rounded-full shadow-lg"
                >
                  Download Free for Mac & Windows
                </Link>
                <a
                  href="https://github.com/webprodigies/murmur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center text-sm font-semibold text-white bg-white/[0.06] border border-white/[0.1] py-3 px-4 rounded-full"
                >
                  Star on GitHub (4.8k)
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
