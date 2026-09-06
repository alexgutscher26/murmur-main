"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Download,
  ShieldCheck,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { generateLicenseKey, PlanTierKey } from "@/lib/stripe";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "mock_sess_complete";
  const planParam = (searchParams.get("plan") as PlanTierKey) || "pro_lifetime";
  const discountCode = searchParams.get("code") || null;
  const keyParam = searchParams.get("key");

  const [licenseKey, setLicenseKey] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Generate/retrieve stable license key for this session
    const key = keyParam || generateLicenseKey(planParam, discountCode);
    setLicenseKey(key);
  }, [planParam, discountCode, keyParam]);

  const handleCopy = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isLifetime = planParam === "pro_lifetime";
  const planTitle = isLifetime ? "Pro Lifetime Perpetual License" : "Pro Annual Pass";

  return (
    <div className="relative pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
      {/* Celebration badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-mono font-semibold mb-6 shadow-sm">
        <CheckCircle2 className="size-4 text-emerald-600" />
        Payment Verified · Welcome to Murmur Pro
      </div>

      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 mb-4">
        You're all set! Own your software forever.
      </h1>
      <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto mb-10">
        Thank you for supporting 100% private, on-device voice dictation. Your personal license key
        has been generated and is ready to activate.
      </p>

      {/* Main License Key Card */}
      <div className="p-6 sm:p-9 rounded-3xl bg-white border-2 border-neutral-900 shadow-xl text-left mb-10 relative overflow-hidden ring-4 ring-neutral-900/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="size-4 text-emerald-600" />
              <span className="text-xs font-mono font-semibold uppercase text-neutral-500 tracking-wider">
                Personal License Key
              </span>
            </div>
            <h2 className="text-lg font-bold text-neutral-950">{planTitle}</h2>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold w-fit">
            Valid on 2 Personal Devices
          </span>
        </div>

        {/* License Key Box */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="font-mono text-base sm:text-xl font-bold tracking-wider text-neutral-950 select-all">
            {licenseKey || "GENERATING-KEY..."}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-4 text-neutral-500" />
                  <span>Copy Key</span>
                </>
              )}
            </button>

            <a
              href={`murmur://activate?key=${encodeURIComponent(licenseKey)}`}
              className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Activate in App</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Activation Steps */}
        <div className="pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
            How to activate inside Murmur:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/70">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px] mb-2">
                1
              </span>
              <span className="font-semibold text-neutral-900 block">Open Murmur Desktop</span>
              <span className="text-neutral-500 text-[11px]">
                Launch Murmur on your Mac or Windows machine.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/70">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px] mb-2">
                2
              </span>
              <span className="font-semibold text-neutral-900 block">Go to Billing View</span>
              <span className="text-neutral-500 text-[11px]">
                Click "Billing" in the sidebar navigation or press ⌘,.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/70">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px] mb-2">
                3
              </span>
              <span className="font-semibold text-neutral-900 block">Paste Key & Unlock</span>
              <span className="text-neutral-500 text-[11px]">
                Paste your key into "Activate License Key" and press Enter.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* App Download Links if not already installed */}
      <div className="p-6 sm:p-7 rounded-3xl bg-neutral-50 border border-neutral-200/90 text-left mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-950">
              Don't have the desktop app installed yet?
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Download the latest native release for macOS or Windows.
            </p>
          </div>
          <Link
            href="/#download"
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 transition-colors w-fit shrink-0"
          >
            <Download className="size-4" />
            <span>Download App</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-200/60">
          <span>• macOS Apple Silicon (.dmg)</span>
          <span>• macOS Intel (.dmg)</span>
          <span>• Windows 10/11 DirectML (.exe)</span>
          <span>• Windows MSIX Package</span>
        </div>
      </div>

      {/* Receipt metadata */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>
            Receipt Reference:{" "}
            <span className="font-mono text-neutral-700">{sessionId.slice(0, 24)}...</span>
          </span>
        </div>
        <Link
          href="/pricing"
          className="text-neutral-700 hover:text-neutral-950 font-medium underline"
        >
          Return to Pricing Page →
        </Link>
      </div>
    </div>
  );
}

export default function PricingSuccessPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white relative overflow-x-hidden">
      <Navbar />
      <Suspense
        fallback={
          <div className="pt-40 text-center text-neutral-500">Loading order receipt...</div>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
