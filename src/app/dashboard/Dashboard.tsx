/**
 * SOURCE OF TRUTH KEYWORDS: Dashboard, getRegistry, navItems, useHashRoute,
 *   dictationHotkey, StatsView, HistoryView, SettingsView, ShortcutsModal, ChangelogModal
 * WHAT:  The dashboard shell: fetches the registry once, builds the sidebar from
 *        its nav entries, renders the view for the current route, and hosts
 *        the global keyboard shortcuts and in-app changelog modals.
 * WHY:   One get_registry for the whole window. Integrates keyboard shortcut
 *        navigation (Cmd+1..4, '?') and release notes without adding external dependencies.
 * WHERE: Mounted by src/entries/dashboard.tsx. Views live in ./stats, ./history,
 *        ./settings, and ./billing.
 */

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Keyboard } from "lucide-react";
import { commands, type HotkeyBinding, type NavDef, type RegistrySnapshot, type SettingValue } from "@/lib/bindings";
import { useCommand } from "@/lib/ipc";
import { useSettings } from "./use-settings";
import {
  EmptyState,
  ErrorBoundary,
  ErrorSurface,
  Skeleton,
  ScrollArea,
  ShortcutsModal,
  ChangelogModal,
  Mark,
} from "@/components/global";
import { iconFor } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { PageShell } from "./_components/PageShell";
import { UpdateNotice } from "./_components/UpdateNotice";
import { BillingView } from "./billing";
import { navigateTo, useHashRoute } from "./use-hash-route";
import { dictationModeFrom, type DictationMode } from "@/lib/dictation-mode";
import { useTauriEvent } from "@/lib/use-event";
import { navSelectedChannel } from "@/lib/window-events";
import { useWindowBoundsPersistence } from "@/lib/window-state";
import { StatsView } from "./stats/StatsView";
import { HistoryView } from "./history/HistoryView";
import { SettingsView } from "./settings/SettingsView";

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
    const override = hotkey.setting_key ? values?.[hotkey.setting_key] : undefined;
    return override?.type === "HOTKEY" ? override.value : hotkey.default;
  }
  return null;
}

export function Dashboard() {
  useWindowBoundsPersistence();
  const registry = useCommand(commands.getRegistry, []);
  const settings = useSettings();
  const { route, section } = useHashRoute();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  useTauriEvent(navSelectedChannel, (payload) => navigateTo(payload.route));

  // Global dashboard keyboard shortcuts (Cmd/Ctrl + 1..4, and '?')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (!isInput && e.key === "?") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          navigateTo("stats");
        } else if (e.key === "2") {
          e.preventDefault();
          navigateTo("history");
        } else if (e.key === "3") {
          e.preventDefault();
          navigateTo("settings");
        } else if (e.key === "4") {
          e.preventDefault();
          navigateTo("billing");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = useMemo<NavDef[]>(() => {
    const items = (registry.data?.capabilities ?? [])
      .map((capability) => capability.nav)
      .filter((nav): nav is NavDef => nav !== null);
    return items.sort((a, b) => a.order - b.order);
  }, [registry.data]);

  const metrics = useMemo(
    () => (registry.data?.capabilities ?? []).flatMap((capability) => capability.metrics),
    [registry.data],
  );

  if (registry.error) {
    return (
      <main className="flex h-full items-center justify-center">
        <ErrorSurface error={registry.error} onRetry={registry.reload} />
      </main>
    );
  }

  const activeRoute = navItems.some((item) => item.route === route)
    ? route
    : (navItems[0]?.route ?? "");

  const activeTitle = navItems.find((item) => item.route === activeRoute)?.label ?? "";

  const headerActions = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setShowChangelog(true)}
        className="hairline flex items-center gap-1.5 h-7 rounded-full bg-sunken px-2.5 text-[11px] font-medium text-text-secondary hover:bg-sunken-strong hover:text-text-primary transition-colors"
        title="What's New in Murmur"
      >
        <Sparkles className="size-3 text-text-primary" />
        <span>What's new</span>
      </button>

      <button
        type="button"
        onClick={() => setShowShortcuts(true)}
        className="hairline flex items-center gap-1 h-7 rounded-full bg-sunken px-2.5 text-[11px] font-medium text-text-secondary hover:bg-sunken-strong hover:text-text-primary transition-colors"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="size-3" />
        <span className="font-mono">?</span>
      </button>
    </div>
  );

  return (
    <main className="flex h-full w-full bg-[var(--surface-opaque)] text-[var(--text-primary)]">
      {/* Navigation Sidebar */}
      <aside className="flex w-16 shrink-0 flex-col items-center border-r border-hairline bg-sunken/40 py-4">
        <Mark label="Murmur" className="mb-6 shrink-0" />
        <nav aria-label="Sections" className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = iconFor(item.icon);
            const isActive = item.route === activeRoute;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => navigateTo(item.route)}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-input transition-colors",
                  isActive
                    ? "bg-sunken-strong text-text-primary shadow-sm"
                    : "text-text-secondary hover:bg-sunken hover:text-text-primary",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <PageShell title={activeTitle} actions={headerActions}>
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
              <ScrollArea contentClassName="px-[var(--page-padding-x)] pb-8">
                <Skeleton rows={4} />
              </ScrollArea>
            )}
          </ErrorBoundary>
        </PageShell>
        <UpdateNotice />
      </div>

      {/* Global Modals */}
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
    </main>
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
    case "stats":
      return <StatsView metrics={metrics} hotkey={hotkey} mode={mode} />;
    case "history":
      return <HistoryView hotkey={hotkey} mode={mode} />;
    case "settings":
      return <SettingsView registry={registry} section={section} />;
    case "billing":
      return <BillingView />;
    default:
      return (
        <EmptyState
          headline="Nothing here yet"
          description="This section of Murmur has not been built."
        />
      );
  }
}
