/**
 * SOURCE OF TRUTH KEYWORDS: SettingsView, getRegistry, getSettings, setSetting,
 *   SettingSection, SECTION_ORDER, advanced-disclosure, toControlSetting, AppProfiles,
 *   settings-search, theme-switcher
 * WHAT:  The settings page: real-time search, registry SettingDefs grouped by section,
 *        theme switcher (System/Light/Dark), model manager, dictionary, per-app profiles,
 *        and settings backup.
 * WHY:   Dynamic search and explicit theme control make power-user workflows instant.
 * WHERE: Rendered by Dashboard.tsx for the registry's "settings" route.
 */

import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X, Sun, Moon, Monitor } from "lucide-react";
import { useScrollRestoration } from "../use-scroll-restoration";
import {
  commands,
  type AppError,
  type EngineCapabilities,
  type OsPermission,
  type PermissionReport,
  type RegistrySnapshot,
  type SettingDef as RegistrySettingDef,
  type SettingSection,
  type SettingValue,
} from "@/lib/bindings";
import { unwrapCommand, useCommand } from "@/lib/ipc";
import { missingPermissions, usePermissions } from "@/lib/use-permissions";
import { useSettings } from "../use-settings";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { ErrorSurface, SettingControl, Skeleton, EmptyState } from "@/components/global";
import type { SettingOption } from "@/components/global";
import { PermissionNotice } from "./_components/PermissionNotice";
import { ModelManager } from "./_components/ModelManager";
import { AppProfiles } from "./_components/AppProfiles";
import { SettingsBackup } from "./_components/SettingsBackup";
import { WpmCalibrationWizard } from "../_components/WpmCalibrationWizard";
import { toControlSetting, type DynamicOptions } from "./to-setting-def";
import { navigateTo } from "../use-hash-route";

/** Presentation order and wording */
const SECTION_ORDER: readonly SettingSection[] = [
  "RECORDING",
  "TRANSCRIPTION",
  "OUTPUT",
  "PRIVACY",
  "GENERAL",
];

const SECTION_LABEL: Readonly<Record<SettingSection, string>> = {
  RECORDING: "Recording",
  TRANSCRIPTION: "Transcription",
  OUTPUT: "Output",
  VOCABULARY: "Vocabulary",
  PRIVACY: "Privacy",
  GENERAL: "General",
};

export interface SettingsViewProps {
  registry: RegistrySnapshot;
  section: string | null;
}

export function SettingsView({ registry, section }: SettingsViewProps) {
  const settings = useSettings();
  const devices = useCommand(commands.listInputDevices, []);
  const models = useCommand(commands.listModels, []);
  const languages = useCommand(commands.listLanguages, []);
  const engine = useCommand(commands.getEngineCapabilities, []);
  const permissions = usePermissions();
  const [writeError, setWriteError] = useState<AppError | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { containerRef, onScroll } = useScrollRestoration("settings", Boolean(settings.data));

  useLayoutEffect(() => {
    if (section && containerRef.current) {
      if (section.toLowerCase() === "dictionary" || section.toLowerCase() === "vocabulary") {
        navigateTo("dictionary");
        return;
      }
      const target = containerRef.current.querySelector(`[data-section="${section.toLowerCase()}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [section, settings.data, containerRef]);

  const dynamic = useMemo<DynamicOptions>(() => {
    const deviceOptions: SettingOption[] = (devices.data ?? []).map((device) => ({
      value: device.id,
      label: device.is_default ? `${device.name} (system default)` : device.name,
    }));
    const modelOptions: SettingOption[] = (models.data ?? []).map((model) => ({
      value: model.descriptor.id,
      label: model.descriptor.display_name,
      description: `${formatBytes(model.descriptor.size_bytes)} · ${model.descriptor.approx_ram_mb} MB memory`,
      disabled: model.state.kind !== "READY",
    }));

    const engineName = engine.data?.display_name ?? "the selected engine";
    const languageOptions: SettingOption[] = (languages.data ?? []).map((language) => ({
      value: language.code,
      label: language.supported ? language.label : `${language.label} — not supported by ${engineName}`,
      description: language.supported ? undefined : `${engineName} cannot transcribe ${language.label}.`,
      disabled: !language.supported,
    }));
    return { INPUT_DEVICES: deviceOptions, MODELS: modelOptions, LANGUAGES: languageOptions };
  }, [devices.data, engine.data, languages.data, models.data]);

  const write = useCallback((key: string, value: SettingValue) => {
    void unwrapCommand(() => commands.setSetting({ key, value })).then((result) => {
      setWriteError(result.status === "error" ? result.error : null);
    });
  }, []);

  const allDefs = useMemo(
    () => registry.capabilities.flatMap((capability) => capability.settings),
    [registry],
  );

  const grouped = useMemo(() => {
    const map = new Map<SettingSection, RegistrySettingDef[]>();
    for (const capability of registry.capabilities) {
      for (const def of capability.settings) {
        const bucket = map.get(def.section);
        if (bucket) bucket.push(def);
        else map.set(def.section, [def]);
      }
    }
    return map;
  }, [registry]);

  const filteredDefs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    return allDefs.filter(
      (def) =>
        def.label.toLowerCase().includes(query) ||
        def.description.toLowerCase().includes(query) ||
        def.key.toLowerCase().includes(query) ||
        SECTION_LABEL[def.section]?.toLowerCase().includes(query)
    );
  }, [allDefs, searchQuery]);

  if (settings.error) return <ErrorSurface error={settings.error} onRetry={settings.reload} />;

  if (!settings.data) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto px-8 py-6">
        <Skeleton rows={8} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      data-scroll-area
      className="flex h-full min-h-0 flex-col overflow-y-auto px-8 py-6 space-y-6"
    >
      {writeError ? <ErrorSurface size="compact" error={writeError} /> : null}

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Manage your speech models, audio input, keyboard shortcuts, and app preferences.
        </p>
      </div>

      {/* Real-time Settings Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 dark:text-stone-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings, models, shortcuts, or hotkeys..."
          className="w-full h-9 rounded-xl border border-stone-200/80 bg-stone-50/80 pl-9 pr-8 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:border-stone-800 dark:bg-stone-900/50 dark:text-white dark:placeholder:text-stone-500 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-0.5 rounded-full"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Search Results View */}
      {filteredDefs !== null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-caption text-text-secondary">
              Found {filteredDefs.length} matching setting{filteredDefs.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-caption text-text-primary underline hover:opacity-80"
            >
              Clear search
            </button>
          </div>

          {filteredDefs.length === 0 ? (
            <EmptyState
              headline="No settings match your search"
              description="Try searching for a different setting, keyword, or clear your query."
            />
          ) : (
            <div className="hairline rounded-card bg-surface p-4 divide-y divide-[var(--border-hairline)]">
              {filteredDefs.map((def) => (
                <div key={def.key} className="py-2">
                  <span className="text-[10px] font-mono text-text-tertiary uppercase block">
                    {SECTION_LABEL[def.section]}
                  </span>
                  <SettingControl
                    setting={toControlSetting(def, settings.data?.[def.key], dynamic, engine.data, permissions.data, (value) =>
                      write(def.key, value),
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Regular Grouped Sections View */
        <>
          {SECTION_ORDER.map((key) => {
            const defs = grouped.get(key) ?? [];
            const extra = EXTRAS[key];
            if (defs.length === 0 && !extra) return null;

            return (
              <SettingsSection
                key={key}
                sectionKey={key.toLowerCase()}
                title={SECTION_LABEL[key]}
                highlighted={section === key.toLowerCase()}
                defs={defs}
                values={settings.data}
                dynamic={dynamic}
                engine={engine.data}
                permissions={permissions.data}
                onWrite={write}
                extra={extra}
              />
            );
          })}

          {/* Per-App Profiles Section */}
          <section data-section="profiles" className="flex flex-col gap-1 pt-4">
            <h2 className="text-base font-semibold text-stone-900 dark:text-white">Per-app profiles</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Settings that apply only while a particular app is in front. Anything a profile does not override keeps
              following the global setting.
            </p>
            <AppProfiles
              defs={allDefs}
              globals={settings.data}
              dynamic={dynamic}
              engine={engine.data}
              permissions={permissions.data}
            />
          </section>
        </>
      )}
    </div>
  );
}

/** Panels that are not settings but belong inside a section. */
type SectionPanel = "MODELS_PANEL" | "PRIVACY_PANEL";

const EXTRAS: Partial<Record<SettingSection, SectionPanel>> = {
  TRANSCRIPTION: "MODELS_PANEL",
  PRIVACY: "PRIVACY_PANEL",
};

function SettingsSection({
  title,
  highlighted,
  defs,
  values,
  dynamic,
  engine,
  permissions,
  onWrite,
  extra,
  sectionKey,
}: {
  title: string;
  highlighted: boolean;
  defs: readonly RegistrySettingDef[];
  values: { [key in string]: SettingValue } | null;
  dynamic: DynamicOptions;
  engine: EngineCapabilities | null;
  permissions: readonly PermissionReport[] | null;
  onWrite: (key: string, value: SettingValue) => void;
  extra: SectionPanel | undefined;
  sectionKey?: string;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const { theme, setTheme } = useTheme();

  const plain = defs.filter((def) => !def.advanced);
  const advanced = defs.filter((def) => def.advanced);
  const hasBaselineWpm = defs.some((def) => def.key === "general.baseline_wpm");
  const baselineWpm =
    (values?.["general.baseline_wpm"]?.type === "NUMBER"
      ? values["general.baseline_wpm"].value
      : null) ?? 40;

  const blocking = [
    ...new Set(defs.flatMap((def) => missingPermissions(def.requires_permission, permissions))),
  ] as OsPermission[];

  return (
    <section
      data-section={sectionKey}
      className={cn(
        "flex flex-col gap-1 rounded-card transition-colors",
        highlighted && "bg-elevated p-4 ring-1 ring-[var(--accent)]",
      )}
    >
      {showCalibration ? (
        <WpmCalibrationWizard
          currentBaselineWpm={baselineWpm}
          onClose={() => setShowCalibration(false)}
          onSaved={() => {}}
        />
      ) : null}

      <h2 className="text-base font-semibold text-stone-900 dark:text-white mt-3 mb-1">{title}</h2>

      <PermissionNotice permissions={blocking} />

      {/* Explicit Theme Switcher in General Section */}
      {title === "General" && (
        <div className="flex items-center justify-between py-3 border-b border-stone-200/60 dark:border-stone-800/80">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">Interface theme</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Follow system appearance or force light or dark mode.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-stone-200/80 bg-stone-100/80 p-0.5 dark:border-stone-800 dark:bg-stone-900">
            {(
              [
                { id: "system", label: "System", icon: <Monitor className="size-3.5" /> },
                { id: "light", label: "Light", icon: <Sun className="size-3.5" /> },
                { id: "dark", label: "Dark", icon: <Moon className="size-3.5" /> },
              ] as { id: ThemeChoice; label: string; icon: React.ReactNode }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                  theme === opt.id
                    ? "bg-white text-stone-900 shadow-xs dark:bg-stone-800 dark:text-white"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                )}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {plain.map((def) => (
        <SettingControl
          key={def.key}
          className="hairline-b last:border-b-0"
          setting={toControlSetting(def, values?.[def.key], dynamic, engine, permissions, (value) =>
            onWrite(def.key, value),
          )}
        />
      ))}

      {hasBaselineWpm ? (
        <>
          <div className="flex items-center justify-between py-3 border-b border-stone-200/60 dark:border-stone-800/80">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">Calibrate typing speed</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Measure your speech pace or take a typing test to accurately benchmark your baseline speed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCalibration(true)}
              className="h-8 shrink-0 rounded-xl border border-stone-200/80 bg-stone-100 px-3 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-200/80 dark:border-stone-800 dark:bg-stone-800/80 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              Calibrate speed…
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-stone-200/60 dark:border-stone-800/80">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">First-run setup</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Redo microphone permissions, audio calibration, and the dictation hotkey test.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void unwrapCommand(commands.openOnboardingWindow);
              }}
              className="h-8 shrink-0 rounded-xl border border-stone-200/80 bg-stone-100 px-3 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-200/80 dark:border-stone-800 dark:bg-stone-800/80 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              Run setup again…
            </button>
          </div>
          <div className="pt-2">
            <SettingsBackup />
          </div>
        </>
      ) : null}

      {extra === "MODELS_PANEL" ? (
        <div data-section="models">
          <ModelManager />
        </div>
      ) : null}
      {extra === "PRIVACY_PANEL" ? <PrivacyControls /> : null}

      {advanced.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setShowAdvanced((open) => !open)}
            aria-expanded={showAdvanced}
            className="flex w-fit items-center gap-1 py-2 text-label text-text-secondary transition-colors hover:text-text-primary"
          >
            <ChevronDown className={cn("size-4 transition-transform", showAdvanced && "rotate-180")} />
            Advanced
          </button>
          {showAdvanced
            ? advanced.map((def) => (
                <SettingControl
                  key={def.key}
                  className="hairline-b last:border-b-0"
                  setting={toControlSetting(def, values?.[def.key], dynamic, engine, permissions, (value) =>
                    onWrite(def.key, value),
                  )}
                />
              ))
            : null}
        </>
      ) : null}
    </section>
  );
}

/** Privacy panel controls for history clearing and full data wipe */
function PrivacyControls() {
  const [confirmingHistory, setConfirmingHistory] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState<number | null>(null);

  const [confirmingWipe, setConfirmingWipe] = useState(false);
  const [wipeStats, setWipeStats] = useState<string | null>(null);

  return (
    <div className="flex flex-col divide-y divide-[var(--border-hairline)] pt-1">
      {/* Clear Transcripts */}
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-body text-text-primary">Delete all history</p>
          <p className="text-caption text-text-secondary">
            {deletedHistory === null
              ? "Every transcript, permanently. This cannot be undone."
              : `Deleted ${deletedHistory} transcript${deletedHistory === 1 ? "" : "s"}.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!confirmingHistory) {
              setConfirmingHistory(true);
              return;
            }
            void unwrapCommand(commands.clearHistory).then((result) => {
              if (result.status === "ok") setDeletedHistory(result.data);
              setConfirmingHistory(false);
            });
          }}
          onBlur={() => setConfirmingHistory(false)}
          className={cn(
            "hairline h-8 shrink-0 rounded-input px-3 text-body transition-colors",
            confirmingHistory
              ? "bg-danger text-opaque-elevated"
              : "bg-sunken text-text-primary hover:text-danger",
          )}
        >
          {confirmingHistory ? "Delete history" : "Delete history…"}
        </button>
      </div>

      {/* Wipe All Data / Factory Reset */}
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-body text-danger font-medium">Delete all data & reset</p>
          <p className="text-caption text-text-secondary">
            {wipeStats ??
              "Drops all transcripts, custom dictionary entries, and resets all settings to defaults."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!confirmingWipe) {
              setConfirmingWipe(true);
              return;
            }
            void unwrapCommand(commands.wipeAllData).then((result) => {
              if (result.status === "ok") {
                const { sessions_deleted, dictionary_entries_deleted, settings_deleted } =
                  result.data;
                setWipeStats(
                  `Reset complete. Wiped ${sessions_deleted} sessions, ${dictionary_entries_deleted} vocabulary items, and reset ${settings_deleted} settings.`,
                );
              }
              setConfirmingWipe(false);
            });
          }}
          onBlur={() => setConfirmingWipe(false)}
          className={cn(
            "hairline h-8 shrink-0 rounded-input px-3 text-body transition-colors",
            confirmingWipe
              ? "bg-danger text-opaque-elevated font-semibold shadow-sm"
              : "bg-sunken text-danger hover:bg-danger/10",
          )}
        >
          {confirmingWipe ? "Confirm wipe all" : "Delete all data…"}
        </button>
      </div>
    </div>
  );
}
