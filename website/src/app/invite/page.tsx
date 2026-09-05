"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Gift,
  Download,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

function InviteContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "MURMUR-PROMO";
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
      {/* Invitation Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-mono font-semibold mb-6 shadow-sm">
        <Gift className="size-4 text-emerald-600 animate-pulse" />
        Personal Invitation · Welcome Bonus Unlocked
      </div>

      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-950 mb-5">
        You've been invited to
        <span className="block text-gradient-hero mt-1">100% Private AI Dictation.</span>
      </h1>
      <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        Experience sub-200ms instantaneous speech-to-text running directly on your computer's CPU and GPU.
        Audio never touches the cloud. Never leaves RAM.
      </p>

      {/* Referral Reward Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/50 via-white to-neutral-50/70 border-2 border-emerald-600/30 shadow-xl text-left mb-12 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-emerald-600" />
              <span className="text-xs font-mono font-semibold uppercase text-emerald-800 tracking-wider">
                Invitation Gift Applied
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-950">
              Free Developer Prompt Pack & Welcome Discount
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500">Referral Code:</span>
            <div className="px-3 py-1 rounded-xl bg-white border border-neutral-200 text-xs font-mono font-bold text-neutral-900 flex items-center gap-2">
              <span>{refCode}</span>
              <button
                onClick={handleCopyCode}
                title="Copy referral code"
                className="text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 text-xs text-neutral-700">
          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="font-bold text-neutral-950 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>Free Starter Tier</span>
            </div>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Unlimited on-device dictation forever with Whisper Base. Zero payment required.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="font-bold text-neutral-950 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>Pro Pack Unlocked</span>
            </div>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Conventional commits, markdown schemas, and LaTeX math triggers included.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="font-bold text-neutral-950 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>100% Offline & Private</span>
            </div>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Air-gap verified. Zero cloud compute taxes or monthly privacy leaks.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/#download"
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="size-4" />
            <span>Download Murmur Free</span>
          </Link>
          <Link
            href={`/pricing?ref=${encodeURIComponent(refCode)}`}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Explore Pro Plans & Pricing</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Feature comparison highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mb-12">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <Zap className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-950 mb-1">Sub-200ms Latency</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Words inject instantly as you finish speaking. Faster than cloud-streaming dictation with zero buffering.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-950 mb-1">100% Local Processing</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Uses local whisper.cpp with Metal (macOS) and DirectML (Windows) hardware acceleration. Audio never leaves RAM.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <Cpu className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-950 mb-1">Own Your Software</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Free forever tier or perpetual Lifetime license. Say goodbye to $15/month subscriptions for simple voice-to-text.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white relative overflow-x-hidden">
      <Navbar />
      <Suspense fallback={<div className="pt-40 text-center text-neutral-500">Loading invite...</div>}>
        <InviteContent />
      </Suspense>
      <Footer />
    </main>
  );
}
