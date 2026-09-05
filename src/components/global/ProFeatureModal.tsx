/**
 * SOURCE OF TRUTH KEYWORDS: ProFeatureModal, feature-gating, license-activation, trial-activation
 * WHAT:  The Pro Feature Gate Modal in Murmur desktop app.
 * WHY:   Presents a sleek, translucent dialog whenever a Free user attempts to access
 *        a gated capability (Large v3 Turbo, Context Engine, filler removal, unlimited dictionary).
 * WHERE: Triggered from ModelManager, AppProfiles, DictionaryManager, and SettingsView.
 */

import { useEffect, useState } from "react";
import { X, Sparkles, Check, KeyRound, ExternalLink, Lock } from "lucide-react";
import { usePlan } from "@/lib/plan";
import { openUrl } from "@tauri-apps/plugin-opener";

export interface ProFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  description?: string;
  benefits?: string[];
}

export function ProFeatureModal({
  isOpen,
  onClose,
  featureName = "Pro Capability",
  description = "This feature requires Murmur Pro for peak accuracy and custom context adaptation.",
  benefits = [
    "Whisper Large v3 Turbo & Medium models with sub-200ms latency",
    "Smart Context Engine with per-app formatting (VS Code, Slack, Notion)",
    "Automatic filler word stripping (removes ums/ahs in real time)",
    "Unlimited custom vocabulary dictionary words and domain packs",
  ],
}: ProFeatureModalProps) {
  const { isTrial, trialDaysRemaining, startTrial, activateLicense } = usePlan();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowKeyInput(false);
      setKeyInput("");
      setKeyError(false);
      setKeySuccess(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenPricing = async () => {
    try {
      await openUrl("https://murmur.app/pricing");
    } catch {
      window.open("https://murmur.app/pricing", "_blank");
    }
  };

  const handleStartTrial = () => {
    startTrial();
    onClose();
  };

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError(false);
    const ok = activateLicense(keyInput);
    if (ok) {
      setKeySuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setKeyError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="hairline relative w-full max-w-md rounded-card bg-surface p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-input p-1.5 text-text-tertiary transition-colors hover:bg-sunken hover:text-text-primary"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-caption font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
            <Sparkles className="size-3" />
            MURMUR PRO
          </span>
          <span className="flex items-center gap-1 text-caption text-text-tertiary">
            <Lock className="size-3" /> Locked on Free
          </span>
        </div>

        <h3 className="text-title font-bold text-text-primary mb-1.5">
          Unlock {featureName}
        </h3>
        <p className="text-body text-text-secondary mb-4 leading-relaxed">
          {description}
        </p>

        {/* Benefits list */}
        <div className="hairline rounded-input bg-sunken/60 p-3.5 space-y-2 mb-5">
          <p className="text-label text-text-tertiary uppercase tracking-wider text-[10px]">
            What's included in Pro:
          </p>
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-start gap-2 text-caption text-text-secondary">
              <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {!isTrial ? (
            <button
              type="button"
              onClick={handleStartTrial}
              className="w-full h-10 rounded-input bg-text-primary text-opaque-elevated text-body font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            >
              <Sparkles className="size-4 text-emerald-400" />
              <span>Start 14-Day Free Trial</span>
            </button>
          ) : (
            <div className="hairline rounded-input bg-sunken p-2 text-center text-caption text-text-secondary">
              Trial active: {trialDaysRemaining} days remaining
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenPricing}
            className="hairline w-full h-10 rounded-input bg-surface text-text-primary text-body font-medium flex items-center justify-center gap-2 transition-colors hover:bg-sunken"
          >
            <span>View Pricing & Upgrade on Website</span>
            <ExternalLink className="size-3.5 text-text-tertiary" />
          </button>
        </div>

        {/* License key accordion toggle */}
        <div className="mt-4 pt-4 border-t hairline-t">
          {!showKeyInput ? (
            <button
              type="button"
              onClick={() => setShowKeyInput(true)}
              className="text-caption text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1.5 mx-auto"
            >
              <KeyRound className="size-3.5" />
              <span>Already purchased? Enter your license key</span>
            </button>
          ) : (
            <form onSubmit={handleActivateKey} className="space-y-2 animate-in fade-in duration-150">
              <label htmlFor="pro-license-key" className="block text-label text-text-tertiary uppercase tracking-wider text-[10px]">
                License Key (LIFETIME-*, PRO-*, STUDENT-*, SWITCHER-*)
              </label>
              <div className="flex gap-2">
                <input
                  id="pro-license-key"
                  type="text"
                  placeholder="LIFETIME-XXXX-XXXX"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="hairline h-8 flex-1 rounded-input bg-sunken px-2.5 font-mono text-caption text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-text-primary"
                />
                <button
                  type="submit"
                  className="hairline h-8 px-3 rounded-input bg-text-primary text-opaque-elevated text-caption font-semibold transition-opacity hover:opacity-90 shrink-0"
                >
                  Activate
                </button>
              </div>
              {keySuccess && (
                <p className="text-caption font-mono text-emerald-600 dark:text-emerald-400">
                  ✓ License key activated! Pro features unlocked.
                </p>
              )}
              {keyError && (
                <p className="text-caption font-mono text-danger">
                  ✕ Invalid license format. Please verify your key.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
