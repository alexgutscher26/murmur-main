/**
 * SOURCE OF TRUTH KEYWORDS: Dashboard, MurmurShell, navItems, useHashRoute,
 *   dictationHotkey, StatsView, HistoryView, SettingsView, ShortcutsModal, ChangelogModal
 * WHAT:  The dashboard shell redesigned with rich modern aesthetics:
 *        - Window bar with sidebar toggle, user avatar, bell
 *        - Expanded left sidebar (Murmur branding, navigation items, words remaining
 *          quota card, team invite, free month, settings with badge, help)
 *        - Spacious rounded white canvas card hosting active views
 * WHERE: Mounted by src/entries/dashboard.tsx.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  CircleDot,
  FileText,
  HelpCircle,
  Mic,
  PanelLeft,
  Scissors,
  Settings,
  Type,
  User,
  WandSparkles,
  X,
  Gauge,
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  commands,
  type HotkeyBinding,
  type NavDef,
  type RegistrySnapshot,
  type SettingValue,
} from "@/lib/bindings";
import { useCommand } from "@/lib/ipc";
import { useSettings } from "./use-settings";
import {
  ErrorBoundary,
  ErrorSurface,
  Skeleton,
  ScrollArea,
  ShortcutsModal,
  ChangelogModal,
} from "@/components/global";
import { cn } from "@/lib/utils";
import { BillingView } from "./billing";
import { navigateTo, useHashRoute } from "./use-hash-route";
import { dictationModeFrom, type DictationMode } from "@/lib/dictation-mode";
import { useTauriEvent } from "@/lib/use-event";
import { navSelectedChannel } from "@/lib/window-events";
import { useWindowBoundsPersistence } from "@/lib/window-state";
import { StatsView } from "./stats/StatsView";
import { HistoryView } from "./history/HistoryView";
import { SettingsView } from "./settings/SettingsView";
import { InsightsView } from "./insights/InsightsView";
import { DictionaryView } from "./dictionary/DictionaryView";
import { UpdateNotice } from "./_components/UpdateNotice";

/**
 * WHAT:  The user's dictation hotkey — their override if they have one, the
 *        registry's default otherwise.
 */
function dictationHotkey(
  registry: RegistrySnapshot,
  values: { [key in string]: SettingValue } | null,
): HotkeyBinding | null {
  for (const capability of registry.capabilities) {
    const hotkey = capability.hotkey;
    if (!hotkey) continue;
    const override = hotkey.setting_key
      ? values?.[hotkey.setting_key]
      : undefined;
    return override?.type === "HOTKEY" ? override.value : hotkey.default;
  }
  return null;
}

export function Dashboard() {
  useWindowBoundsPersistence();
  const registry = useCommand(commands.getRegistry, []);
  const settings = useSettings();
  const { route, section } = useHashRoute();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resumeCardDismissed, setResumeCardDismissed] = useState(false);

  const isOnboardingIncomplete =
    settings.data?.["general.onboarding_complete"]?.value !== true;
  const savedStepIndex =
    typeof settings.data?.["general.onboarding_step_index"]?.value === "number"
      ? (settings.data["general.onboarding_step_index"].value as number)
      : 0;
  const isAirGapped = settings.data?.["privacy.air_gap_mode"]?.value === true;

  useTauriEvent(navSelectedChannel, (payload) => navigateTo(payload.route));

  // Global dashboard keyboard shortcuts (Cmd/Ctrl + 1..4, and '?')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (!isInput && e.key === "?") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          navigateTo("dictation");
        } else if (e.key === "2") {
          e.preventDefault();
          navigateTo("insights");
        } else if (e.key === "3") {
          e.preventDefault();
          navigateTo("history");
        } else if (e.key === "4") {
          e.preventDefault();
          navigateTo("settings");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const navItems = useMemo<NavDef[]>(() => {
    const items = (registry.data?.capabilities ?? [])
      .map((capability) => capability.nav)
      .filter((nav): nav is NavDef => nav !== null);
    return items.sort((a, b) => a.order - b.order);
  }, [registry.data]);

  const metrics = useMemo(
    () =>
      (registry.data?.capabilities ?? []).flatMap(
        (capability) => capability.metrics,
      ),
    [registry.data],
  );

  // Known dashboard routes matching the sidebar navigation
  const knownRoutes = useMemo(
    () =>
      new Set([
        "dictation",
        "stats",
        "insights",
        "dictionary",
        "snippets",
        "style",
        "transforms",
        "scratchpad",
        "notetaker",
        "history",
        "settings",
        "billing",
      ]),
    [],
  );

  // Active route fallback to "dictation" (or "stats")
  const activeRoute =
    route === "stats"
      ? "dictation"
      : knownRoutes.has(route) || navItems.some((item) => item.route === route)
        ? route
        : "dictation";

  if (registry.error) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#f4f2ee] dark:bg-[#141210]">
        <ErrorSurface error={registry.error} onRetry={registry.reload} />
      </main>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f4f2ee] text-stone-900 select-none dark:bg-[#141210] dark:text-stone-100">
      {/* ── Top Window Bar (Traffic-light / Window Controls) ─────────────── */}
      <header
        data-tauri-drag-region
        className="flex h-10 shrink-0 items-center justify-between px-3"
      >
        {/* Top Left: Sidebar collapse toggle + User profile */}
        <div data-tauri-drag-region={false} className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title="Toggle sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-white transition-colors"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => showToast("Alex's Personal Account")}
            title="Alex Gutscher"
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-white transition-colors"
          >
            <User className="h-4 w-4" />
          </button>
        </div>

        {/* Top Center: Air Gap Isolation Badge */}
        <div data-tauri-drag-region={false} className="flex items-center gap-2.5">
          {isAirGapped && (
            <div
              title="Air-Gap / Hardware Isolation Mode Active: All outbound networking and update checks are disabled."
              className="flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-xs dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Air-Gapped</span>
            </div>
          )}
        </div>

        {/* Top Right: Notifications */}
        <div data-tauri-drag-region={false} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowChangelog(true)}
            title="Notifications & Updates"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-white transition-colors"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* ── Main App Shell Body (Sidebar + Content Canvas) ────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Left Sidebar ───────────────────────────────────────────────── */}
        <aside
          className={cn(
            "flex flex-col justify-between py-2 transition-all duration-200 shrink-0",
            sidebarCollapsed ? "w-14 px-2" : "w-56 px-4",
          )}
        >
          {/* Top Branding & Main Navigation */}
          <div className="flex flex-col min-h-0">
            {/* Logo */}
            <div className="flex items-center gap-2 px-2 py-3 mb-2">
              <div className="flex items-center gap-[2.5px] h-4">
                <div className="w-[3px] h-3 bg-stone-900 dark:bg-white rounded-full" />
                <div className="w-[3px] h-5 bg-stone-900 dark:bg-white rounded-full" />
                <div className="w-[3px] h-3.5 bg-stone-900 dark:bg-white rounded-full" />
                <div className="w-[3px] h-2 bg-stone-900 dark:bg-white rounded-full" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-bold text-base tracking-tight text-stone-900 dark:text-white">
                  Murmur
                </span>
              )}
            </div>

            {/* Navigation items */}
            <nav className="flex flex-col gap-0.5">
              {/* Dictation (Primary Home) */}
              <button
                type="button"
                onClick={() => navigateTo("dictation")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                  activeRoute === "dictation"
                    ? "bg-[#eae5de] dark:bg-stone-800 text-stone-900 dark:text-white font-semibold"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/40 hover:text-stone-900 dark:hover:text-white",
                )}
                title="Dictation"
              >
                <Mic className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Dictation</span>}
              </button>

              {/* Insights */}
              <button
                type="button"
                onClick={() => navigateTo("insights")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                  activeRoute === "insights"
                    ? "bg-[#eae5de] dark:bg-stone-800 text-stone-900 dark:text-white font-semibold"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/40 hover:text-stone-900 dark:hover:text-white",
                )}
                title="Insights"
              >
                <Gauge className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Insights</span>}
              </button>

              {/* Dictionary */}
              <button
                type="button"
                onClick={() => navigateTo("dictionary")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                  activeRoute === "dictionary"
                    ? "bg-[#eae5de] dark:bg-stone-800 text-stone-900 dark:text-white font-semibold"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/40 hover:text-stone-900 dark:hover:text-white",
                )}
                title="Dictionary"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Dictionary</span>}
              </button>
            </nav>
          </div>

          {/* Middle/Bottom Sidebar: Quota Card + Secondary Links */}
          <div className="flex flex-col gap-1">
            {/* Words remaining quota card */}
            {!sidebarCollapsed && (
              <div className="rounded-2xl border border-purple-200/60 bg-[#f8f4fb] p-3.5 dark:border-purple-900/40 dark:bg-purple-950/20 mb-2">
                <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  1,966 words remaining
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                  You get 2,000 words per week. Upgrade for unlimited access.
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo("billing")}
                  className="mt-2.5 w-full rounded-xl bg-stone-900 py-1.5 text-center text-xs font-semibold text-white shadow-xs hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition-colors"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}

            {/* Secondary navigation */}
            <div className="flex flex-col gap-0.5">
              {/* <button
                type="button"
                onClick={() => {
                  void unwrapCommand(() =>
                    commands.copyText({ text: "https://murmur.app/invite/alex" }),
                  ).then(() => showToast("Invite link copied to clipboard!"));
                }}
                className="flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-white transition-colors"
                title="Invite your team"
              >
                <Users className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Invite your team</span>}
              </button> */}

              {/* <button
                type="button"
                onClick={() => {
                  void unwrapCommand(() =>
                    commands.copyText({ text: "MURMUR-FREE-MONTH" }),
                  ).then(() => showToast("Referral code copied!"));
                }}
                className="flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-white transition-colors"
                title="Get a free month"
              >
                <Gift className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Get a free month</span>}
              </button> */}

              <button
                type="button"
                onClick={() => navigateTo("settings")}
                className={cn(
                  "flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors",
                  activeRoute === "settings"
                    ? "bg-[#eae5de] dark:bg-stone-800 text-stone-900 dark:text-white font-semibold"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/40 hover:text-stone-900 dark:hover:text-white",
                )}
                title="Settings"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>Settings</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    1
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowShortcuts(true)}
                className="flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-white transition-colors"
                title="Help"
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Help</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Canvas (Rounded Card) ─────────────────────────────────── */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-stone-200/70 bg-white shadow-xs dark:border-stone-800/80 dark:bg-[#1b1917] text-stone-900 dark:text-stone-100 m-1 mr-3 mb-3">
          {/* Adaptive Onboarding Re-entry Banner */}
          {isOnboardingIncomplete && !resumeCardDismissed && (
            <div className="flex items-center justify-between border-b border-amber-200/70 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 px-5 py-3 dark:border-amber-900/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 animate-in fade-in slide-in-from-top-1 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  <WandSparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      Finish Setting Up Murmur
                    </span>
                    <span className="rounded-md bg-amber-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                      Step {savedStepIndex + 1} of 5
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                    You have incomplete onboarding steps. Resume where you left off to complete guided practice.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void commands.openOnboardingWindow()}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors"
                >
                  <span>Resume Setup</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setResumeCardDismissed(true)}
                  title="Dismiss banner"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-700 hover:bg-amber-200/50 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          <ErrorBoundary
            key={activeRoute}
            fallback={({ error, reset }) => (
              <ErrorSurface
                error={{
                  code: "INTERNAL",
                  message: "This view stopped working.",
                  recoverable: true,
                  action: { kind: "RETRY" },
                  detail: error.message,
                }}
                onRetry={reset}
              />
            )}
          >
            {registry.data ? (
              <View
                route={activeRoute}
                section={section}
                registry={registry.data}
                metrics={metrics}
                hotkey={dictationHotkey(registry.data, settings.data)}
                mode={dictationModeFrom(settings.data)}
              />
            ) : (
              <ScrollArea contentClassName="p-8">
                <Skeleton rows={6} />
              </ScrollArea>
            )}
          </ErrorBoundary>

          {/* ── Docked Update Notification & Release Notes ────────────────── */}
          <UpdateNotice />
        </main>
      </div>

      {/* ── Toast Feedback Notification ──────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-8 z-50 flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg dark:bg-stone-100 dark:text-stone-900 animate-in fade-in slide-in-from-bottom-2">
          <Check className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Global Modals ────────────────────────────────────────────────── */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />
    </div>
  );
}

/** The one route-to-component table. Everything else about the nav is declared. */
function View({
  route,
  section,
  registry,
  metrics,
  hotkey,
  mode,
}: {
  route: string;
  section: string | null;
  registry: RegistrySnapshot;
  metrics: RegistrySnapshot["capabilities"][number]["metrics"];
  hotkey: HotkeyBinding | null;
  mode: DictationMode;
}) {
  switch (route) {
    case "dictation":
    case "stats":
      return <StatsView metrics={metrics} hotkey={hotkey} mode={mode} />;
    case "insights":
      return <InsightsView hotkey={hotkey} mode={mode} />;
    case "history":
      return <HistoryView hotkey={hotkey} mode={mode} />;
    case "settings":
      return <SettingsView registry={registry} section={section} />;
    case "billing":
      return <BillingView />;
    case "notetaker":
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <CircleDot className="h-12 w-12 text-stone-300 dark:text-stone-700 mb-3" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            Notetaker
          </h2>
          <p className="mt-1 text-sm text-stone-500 max-w-sm">
            Automatic meeting notes, speaker attribution, and real-time summaries.
          </p>
        </div>
      );
    case "dictionary":
      return <DictionaryView />;
    case "snippets":
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <Scissors className="h-12 w-12 text-stone-300 dark:text-stone-700 mb-3" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            Snippets
          </h2>
          <p className="mt-1 text-sm text-stone-500 max-w-sm">
            Voice-triggered expansions for canned responses, email signatures, and code.
          </p>
        </div>
      );
    case "style":
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <Type className="h-12 w-12 text-stone-300 dark:text-stone-700 mb-3" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            Style & Tone
          </h2>
          <p className="mt-1 text-sm text-stone-500 max-w-sm">
            Tune formality, casing, punctuation density, and vocabulary filters.
          </p>
        </div>
      );
    case "transforms":
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <WandSparkles className="h-12 w-12 text-stone-300 dark:text-stone-700 mb-3" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            AI Transforms
          </h2>
          <p className="mt-1 text-sm text-stone-500 max-w-sm">
            Convert spoken voice into structured JSON, bulleted tasks, or polished prose.
          </p>
        </div>
      );
    case "scratchpad":
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <FileText className="h-12 w-12 text-stone-300 dark:text-stone-700 mb-3" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            Scratchpad
          </h2>
          <p className="mt-1 text-sm text-stone-500 max-w-sm">
            A continuous freeform scratchpad buffer for dictating uninterrupted thoughts.
          </p>
        </div>
      );
    default:
      return <StatsView metrics={metrics} hotkey={hotkey} mode={mode} />;
  }
}
