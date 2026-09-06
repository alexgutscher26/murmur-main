/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  X,
  GraduationCap,
  GitPullRequest,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PlanTierKey } from "@/lib/stripe";

interface StudentGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "student" | "oss";
}

export function StudentGrantModal({
  isOpen,
  onClose,
  defaultTab = "student",
}: StudentGrantModalProps) {
  const [activeTab, setActiveTab] = useState<"student" | "oss">(defaultTab);
  const [plan, setPlan] = useState<"lifetime" | "annual">("lifetime");

  // Student form state
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [institution, setInstitution] = useState("");

  // OSS form state
  const [ossName, setOssName] = useState("");
  const [ossEmail, setOssEmail] = useState("");
  const [githubProfile, setGithubProfile] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEduEmail =
    studentEmail.toLowerCase().includes(".edu") || studentEmail.toLowerCase().includes(".ac.");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = activeTab === "student" ? studentEmail.trim() : ossEmail.trim();

    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    if (activeTab === "student" && !institution.trim()) {
      setError("Please provide your university or academic institution.");
      return;
    }

    if (activeTab === "oss" && (!githubProfile.trim() || !repoUrl.trim())) {
      setError("Please provide your GitHub username/profile and project repository.");
      return;
    }

    setLoading(true);

    try {
      const tierKey: PlanTierKey = plan === "lifetime" ? "pro_lifetime" : "pro_annual";
      const discountCode = activeTab === "student" ? "STUDENT-50" : "OSS-50";

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: tierKey,
          discountCode,
          customerEmail: email,
        }),
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to initialize grant checkout session");
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
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600" />

        <div className="p-6 sm:p-8">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-800 text-xs font-mono font-semibold w-fit mb-3">
            <GraduationCap className="size-3.5 text-purple-600" />
            50% Grant Program · Pro Lifetime & Annual
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
            Apply for Academic or OSS Sponsorship
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            We support students, educators, and open-source contributors with a permanent 50%
            discount.
          </p>

          {/* Tab switcher */}
          <div className="mt-5 p-1 rounded-2xl bg-neutral-100 flex items-center gap-1 border border-neutral-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab("student");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === "student"
                  ? "bg-white text-neutral-950 shadow-sm border border-neutral-200/80"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              <GraduationCap className="size-4 text-emerald-600" />
              <span>Students & Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("oss");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === "oss"
                  ? "bg-white text-neutral-950 shadow-sm border border-neutral-200/80"
                  : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              <GitPullRequest className="size-4 text-purple-600" />
              <span>Open Source Maintainers</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Plan selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5 uppercase tracking-wider">
                Select Sponsored Plan (50% OFF)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan("lifetime")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    plan === "lifetime"
                      ? "border-purple-500 bg-purple-50/40 ring-2 ring-purple-500/20"
                      : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-950">Pro Lifetime</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      50% OFF
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-purple-700">$44</span>
                    <span className="text-xs text-neutral-400 line-through font-mono">$89</span>
                    <span className="text-[10px] text-neutral-500">once</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlan("annual")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    plan === "annual"
                      ? "border-purple-500 bg-purple-50/40 ring-2 ring-purple-500/20"
                      : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-950">Pro Annual</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      50% OFF
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-purple-700">$24</span>
                    <span className="text-xs text-neutral-400 line-through font-mono">$49</span>
                    <span className="text-[10px] text-neutral-500">/ yr</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab 1: Student fields */}
            {activeTab === "student" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="student-name"
                      className="block text-xs font-semibold text-neutral-800 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="student-inst"
                      className="block text-xs font-semibold text-neutral-800 mb-1"
                    >
                      University / School
                    </label>
                    <input
                      id="student-inst"
                      type="text"
                      required
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="student-email"
                      className="block text-xs font-semibold text-neutral-800"
                    >
                      Academic Email (.edu or university domain)
                    </label>
                    {isEduEmail && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="size-3" /> Verified Academic Domain
                      </span>
                    )}
                  </div>
                  <input
                    id="student-email"
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="jane@university.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </>
            )}

            {/* Tab 2: OSS fields */}
            {activeTab === "oss" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="oss-name"
                      className="block text-xs font-semibold text-neutral-800 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="oss-name"
                      type="text"
                      required
                      value={ossName}
                      onChange={(e) => setOssName(e.target.value)}
                      placeholder="Developer Name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="oss-email"
                      className="block text-xs font-semibold text-neutral-800 mb-1"
                    >
                      Email for License Delivery
                    </label>
                    <input
                      id="oss-email"
                      type="email"
                      required
                      value={ossEmail}
                      onChange={(e) => setOssEmail(e.target.value)}
                      placeholder="dev@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="oss-profile"
                      className="block text-xs font-semibold text-neutral-800 mb-1"
                    >
                      GitHub Profile URL
                    </label>
                    <input
                      id="oss-profile"
                      type="url"
                      required
                      value={githubProfile}
                      onChange={(e) => setGithubProfile(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="oss-repo"
                      className="block text-xs font-semibold text-neutral-800 mb-1"
                    >
                      Open Source Project URL
                    </label>
                    <input
                      id="oss-repo"
                      type="url"
                      required
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/org/repo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600">
              ⚡ <strong>Instant 50% Verification:</strong> Your discount is applied directly at
              checkout with no waiting or complex approval delays.
            </div>

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
                  <span>Claim 50% Grant & Checkout ({plan === "lifetime" ? "$44" : "$24/yr"})</span>
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
