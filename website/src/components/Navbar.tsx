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

  const navLinks = [
    { id: "features", name: "Features", href: isSubPage ? "/#features" : "#features" },
    { id: "playground", name: "Lab", href: isSubPage ? "/#playground" : "#playground" },
    { id: "benchmarks", name: "Benchmarks", href: isSubPage ? "/#benchmarks" : "#benchmarks" },
    { id: "comparison", name: "Comparison", href: isSubPage ? "/#comparison" : "#comparison" },
    { id: "pricing", name: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Floating Glass Island matching Hero aesthetic */}
      <nav className="mt-5 mx-auto w-full max-w-5xl rounded-full bg-white/85 backdrop-blur-xl border border-neutral-200/90 px-3 sm:px-4 py-2 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] pointer-events-auto transition-all duration-300">
        {/* Brand Link */}
        <Link
          href="/"
          className="flex items-center gap-2.5 pl-1.5 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 rounded-full"
        >
          <div className="p-1.5 rounded-xl bg-neutral-100/90 border border-neutral-200/80 group-hover:border-neutral-300 group-hover:bg-neutral-200/60 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <Mark size="sm" animated={true} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-neutral-900 group-hover:text-black transition-colors">
              Murmur
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/90 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              v0.1.0-local
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-0.5 bg-neutral-100/80 border border-neutral-200/70 rounded-full p-1">
          {navLinks.map((link) => {
            const isActive = !link.href.includes("#") && pathname === link.href;
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                  isActive
                    ? "text-neutral-950 bg-white font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-neutral-200/80"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-white/70"
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
            className="group hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          >
            <GithubIcon className="w-3.5 h-3.5 text-neutral-700 group-hover:text-neutral-950 transition-colors" />
            <span>GitHub</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/70">
              4.8k
            </span>
          </a>

          {/* Primary CTA button matching Hero's #141416 pill */}
          <Link
            href="/#download"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#141416] hover:bg-neutral-800 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <span>Download</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-neutral-300" />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden relative w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-neutral-700 hover:text-neutral-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
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

      {/* Mobile Modal matching light clean aesthetic */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-neutral-900/30 flex flex-col justify-center px-6 lg:hidden pointer-events-auto"
          >
            <div className="bg-white/95 backdrop-blur-2xl border border-neutral-200/90 rounded-3xl p-6 shadow-2xl flex flex-col gap-3 max-w-sm mx-auto w-full">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 15, opacity: 0 }}
                  transition={{ duration: 0.25, delay: 0.03 * idx }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-semibold text-neutral-800 hover:text-neutral-950 py-2.5 border-b border-neutral-100 transition-colors flex items-center justify-between focus-visible:outline-none focus-visible:text-black"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 15, opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.25 }}
                className="flex flex-col gap-2.5 mt-4"
              >
                <Link
                  href="/#download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white bg-[#141416] hover:bg-neutral-800 py-3 px-4 rounded-xl shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  Download free for Mac & Windows
                </Link>
                <a
                  href="https://github.com/webprodigies/murmur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center text-sm font-semibold text-neutral-800 hover:text-neutral-950 bg-white hover:bg-neutral-50 border border-neutral-200/90 py-3 px-4 rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
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