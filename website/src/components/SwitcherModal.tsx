"use client";

import React, { useState } from "react";
import { X, Sparkles, ArrowRight, ShieldCheck, Check, AlertCircle } from "lucide-react";
import { PlanTierKey } from "@/lib/stripe";

interface SwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "lifetime" | "annual";
}

const COMPETITORS = [
  { id: "wispr", name: "Wispr Flow ($144/yr)" },
  { id: "superwhisper", name: "Superwhisper ($99–$199)" },
  { id: "dragon", name: "Nuance Dragon ($500+)" },
  { id: "otter", name: "Otter.ai ($120/yr)" },
  { id: "other", name: "Other Cloud Dictation Tool" },
];

export function SwitcherModal({ isOpen, onClose, defaultPlan = "lifetime" }: SwitcherModalProps) {
  const [competitor, setCompetitor] = useState("wispr");
  const [plan, setPlan] = useState<"lifetime" | "annual">(defaultPlan);
  const [email, setEmail] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address for receipt delivery.");
      return;
    }

    setLoading(true);

    try {
      const tierKey: PlanTierKey = plan === "lifetime" ? "pro_lifetime" : "pro_annual";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: tierKey,
          discountCode: "SWITCHER-40",
          customerEmail: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to initialize checkout session");
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        <div className="p-6 sm:p-8">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono font-semibold w-fit mb-3">
            <Sparkles className="size-3.5 text-emerald-600 animate-pulse" />
            Switcher Guarantee · Save up to 40%
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
            Switch from Cloud to 100% Local
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Migrating from Wispr Flow or Superwhisper? Get an instant discount and stop paying cloud
            compute markups for on-device voice processing.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Competitor selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5 uppercase tracking-wider">
                Which tool are you migrating from?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMPETITORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCompetitor(c.id)}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-medium transition-all border ${
                      competitor === c.id
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                        : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5 uppercase tracking-wider">
                Choose Discounted Tier
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan("lifetime")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    plan === "lifetime"
                      ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-950">Pro Lifetime</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Save $20
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-emerald-700">$69</span>
                    <span className="text-xs text-neutral-400 line-through font-mono">$89</span>
                    <span className="text-[10px] text-neutral-500">one-time</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlan("annual")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    plan === "annual"
                      ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-950">Pro Annual</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      40% OFF
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-emerald-700">$29</span>
                    <span className="text-xs text-neutral-400 line-through font-mono">$49</span>
                    <span className="text-[10px] text-neutral-500">/ 1st yr</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Email input */}
            <div>
              <label
                htmlFor="switcher-email"
                className="block text-xs font-semibold text-neutral-800 mb-1"
              >
                Your Email Address
              </label>
              <input
                id="switcher-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
              />
            </div>

            {/* Optional proof or receipt note */}
            <div>
              <label
                htmlFor="switcher-proof"
                className="block text-xs font-semibold text-neutral-800 mb-1"
              >
                Receipt Note or Previous Account Email{" "}
                <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                id="switcher-proof"
                type="text"
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="e.g. Wispr subscription #1234 or active receipt"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
              />
            </div>

            {/* Guarantee note */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5 text-xs text-neutral-600">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>
                Instant coupon auto-applied. Instant license issued upon checkout completion.
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span>Redirecting to Checkout...</span>
              ) : (
                <>
                  <span>
                    Claim Switcher Deal & Checkout ({plan === "lifetime" ? "$69" : "$29"})
                  </span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
