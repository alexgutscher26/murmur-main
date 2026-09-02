"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mark } from "./Mark";
import { GithubIcon } from "./GithubIcon";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isSubPage = pathname !== "/";
  const isPricingPage = pathname === "/pricing";
  const isPrivacyPage = pathname === "/privacy";
  const isBlogPage = pathname.startsWith("/blog");

  const navLinks = [
    { id: "features", name: "Features", href: isSubPage ? "/#features" : "#features" },
    { id: "comparison", name: "Comparison", href: isSubPage ? "/#comparison" : "#comparison" },
    { id: "privacy", name: "Privacy Proof", href: "/privacy" },
    { id: "blog", name: "Blog", href: "/blog" },
    { id: "pricing", name: "Pricing", href: "/pricing" },
    { id: "faq", name: "FAQ", href: isSubPage ? "/#faq" : "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4">
      {/* Fluid Island Nav (B7) */}
      <nav className="mt-6 mx-auto w-max max-w-[95vw] rounded-full bg-[#181818]/90 backdrop-blur-xl border border-[#313131] px-3 py-2 flex items-center gap-3 sm:gap-6 shadow-[0_12px_32px_rgba(0,0,0,0.6)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
        {/* Brand Link */}
        <Link
          href="/"
          className="flex items-center gap-2.5 pl-2 pr-1 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded-full"
        >
          <div className="p-1 rounded-lg bg-[#272727] border border-[#313131] group-hover:border-white/40 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <Mark size="sm" animated={true} />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
            Murmur
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#272727] text-white/70 border border-[#313131]">
              v0.1.0
            </span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#1f1f1f] border border-[#313131] rounded-full px-2 py-1">
          {navLinks.map((link) => {
            const isActive =
              link.id === "pricing"
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
                className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-[#272727]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {/* GitHub Star */}
          <a
            href="https://github.com/webprodigies/murmur"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white bg-[#1f1f1f] hover:bg-[#272727] border border-[#313131] px-3 py-2 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <GithubIcon className="w-4 h-4 text-white" />
            <span>GitHub</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-[#272727] text-white/90">
              4.8k
            </span>
          </a>

          {/* Primary CTA button */}
          <Link
            href="/#download"
            className="flex items-center gap-2 text-sm font-semibold text-black bg-white hover:bg-white/90 px-3 py-2 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            <span>Download</span>
          </Link>
        </div>

        {/* Mobile Hamburger Morph (B7) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full bg-[#1f1f1f] border border-[#313131] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Toggle navigation menu"
        >
          <div className="w-4 h-3.5 relative flex flex-col justify-between">
            <span
              className={`w-full h-0.5 bg-white rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] origin-center ${
                mobileMenuOpen ? "rotate-45 absolute top-1.5" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-white rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                mobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`w-full h-0.5 bg-white rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] origin-center ${
                mobileMenuOpen ? "-rotate-45 absolute top-1.5" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Screen-filling Mobile Modal Expansion (B7) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-40 backdrop-blur-3xl bg-black/90 flex flex-col justify-center px-8 md:hidden"
          >
            <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.05 * idx,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-bold text-white hover:text-white/70 py-2 border-b border-[#272727] transition-colors block"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.35,
                  ease: [0.32, 0.72, 0, 1],
                }}
                className="flex flex-col gap-3 mt-6"
              >
                <Link
                  href="/#download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-base font-semibold text-black bg-white py-3 px-4 rounded-full"
                >
                  Download Murmur
                </Link>
                <a
                  href="https://github.com/webprodigies/murmur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center text-base font-semibold text-white bg-[#181818] border border-[#313131] py-3 px-4 rounded-full"
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
