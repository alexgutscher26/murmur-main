/**
 * SOURCE OF TRUTH KEYWORDS: PlanTier, usePlan, canUseTurboModel, canUseContextEngine, canUseFillerStripper, canUseVoiceSnippets, canUseTeamDictionarySync
 * WHAT:  Single source of truth for plan licensing and feature gating in the Murmur desktop app.
 * WHY:   Centralizes tier capabilities (Starter vs Pro vs Team) so every UI view and setting control checks the same rulebook.
 * WHERE: Consumed by BillingView, SettingsView, model selectors, and enhancement settings.
 */

import { useSyncExternalStore } from "react";

export type PlanTier = "starter" | "pro" | "team";

export interface PlanState {
  tier: PlanTier;
  isTrial: boolean;
  trialExpiresAt: number | null; // timestamp ms
  licenseKey: string | null;
}

const STORAGE_KEY = "murmur.license_plan";

const DEFAULT_STATE: PlanState = {
  tier: "starter",
  isTrial: false,
  trialExpiresAt: null,
  licenseKey: null,
};

let memoryState: PlanState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function getStoredState(): PlanState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Verify trial expiry
    if (parsed.isTrial && parsed.trialExpiresAt && Date.now() > parsed.trialExpiresAt) {
      return { ...parsed, tier: "starter", isTrial: false };
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(next: PlanState) {
  memoryState = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): PlanState {
  if (typeof window !== "undefined" && memoryState === DEFAULT_STATE) {
    memoryState = getStoredState();
  }
  return memoryState;
}

export function usePlan() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_STATE);

  const startTrial = () => {
    const expires = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days
    saveState({
      tier: "pro",
      isTrial: true,
      trialExpiresAt: expires,
      licenseKey: "TRIAL-14DAYS-ACTIVE",
    });
  };

  const setTier = (tier: PlanTier) => {
    saveState({
      ...state,
      tier,
      isTrial: false,
      trialExpiresAt: null,
    });
  };

  const activateLicense = (key: string): boolean => {
    const cleanKey = key.trim().toUpperCase();
    if (!cleanKey) return false;

    if (cleanKey.startsWith("TEAM-")) {
      saveState({
        tier: "team",
        isTrial: false,
        trialExpiresAt: null,
        licenseKey: cleanKey,
      });
      return true;
    } else if (
      cleanKey.startsWith("PRO-") ||
      cleanKey.startsWith("FOUNDING-") ||
      cleanKey.startsWith("LIFETIME-") ||
      cleanKey.startsWith("STUDENT-") ||
      cleanKey.startsWith("OSS-") ||
      cleanKey.startsWith("SWITCHER-") ||
      cleanKey.length >= 8
    ) {
      saveState({
        tier: "pro",
        isTrial: false,
        trialExpiresAt: null,
        licenseKey: cleanKey,
      });
      return true;
    }
    return false;
  };

  const resetToStarter = () => {
    saveState(DEFAULT_STATE);
  };

  const trialDaysRemaining = state.trialExpiresAt
    ? Math.max(0, Math.ceil((state.trialExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    tier: state.tier,
    isTrial: state.isTrial,
    trialDaysRemaining,
    licenseKey: state.licenseKey,
    isStarter: state.tier === "starter",
    isPro: state.tier === "pro" || state.tier === "team",
    isTeam: state.tier === "team",
    startTrial,
    setTier,
    activateLicense,
    resetToStarter,
  };
}

// ── Feature Gate Functions ───────────────────────────────────────────────

/** Whether the user can select Whisper Large v3 Turbo or Medium models */
export function canUseTurboModel(tier: PlanTier): boolean {
  return tier === "pro" || tier === "team";
}

/** Whether the user can activate the Smart Context Engine (VS Code, Slack, Notion) */
export function canUseContextEngine(tier: PlanTier): boolean {
  return tier === "pro" || tier === "team";
}

/** Whether the user can enable automatic filler word stripping */
export function canUseFillerStripper(tier: PlanTier): boolean {
  return tier === "pro" || tier === "team";
}

/** Whether custom dictionary allows unlimited words (Starter allows up to 25) */
export function getDictionaryWordLimit(tier: PlanTier): number {
  if (tier === "starter") return 25;
  return Infinity;
}

/** Whether voice snippets and text expansions are enabled */
export function canUseVoiceSnippets(tier: PlanTier): boolean {
  return tier === "pro" || tier === "team";
}

/** Whether spoken editing commands (new line, delete sentence) are enabled */
export function canUseSpokenCommands(tier: PlanTier): boolean {
  return tier === "pro" || tier === "team";
}

/** Whether domain-specific vocabulary packs (code, legal, med) are enabled */
export function canUseDomainPacks(tier: PlanTier): boolean {
  return tier === "pro" || tier === "team";
}

/** Whether encrypted multi-device sync is enabled */
export function canUseMultiDeviceSync(tier: PlanTier): boolean {
  return tier === "pro" || tier === "team";
}

/** Whether shared team dictionary and centralized pool sync are enabled */
export function canUseTeamDictionarySync(tier: PlanTier): boolean {
  return tier === "team";
}
