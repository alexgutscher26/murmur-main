/**
 * SOURCE OF TRUTH KEYWORDS: AbbreviationManager, AbbreviationItem, expand_abbreviations,
 *   disabled_abbreviations
 * WHAT:  Per-language abbreviation expansion list with user-configurable opt-out.
 * WHY:   Whisper frequently emits unpunctuated spoken abbreviations ("eg", "ie", "vs").
 *        Murmur expands these cleanly into written form ("e.g.", "i.e.", "vs."),
 *        and users can disable individual expansions according to personal preference.
 * WHERE: Rendered under the Enhancement / Output section of SettingsView.
 */

import { useMemo, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingValue } from "@/lib/bindings";

export interface AbbreviationItem {
  needle: string;
  replacement: string;
  description: string;
}

export const ABBREVIATIONS_BY_LANG: Readonly<Record<string, readonly AbbreviationItem[]>> = {
  en: [
    { needle: "eg", replacement: "e.g.", description: "for example (exempli gratia)" },
    { needle: "ie", replacement: "i.e.", description: "that is (id est)" },
    { needle: "etc", replacement: "etc.", description: "and so forth (et cetera)" },
    { needle: "vs", replacement: "vs.", description: "versus / against" },
    { needle: "aka", replacement: "a.k.a.", description: "also known as" },
    { needle: "et al", replacement: "et al.", description: "and others (et alii)" },
  ],
  es: [
    { needle: "ej", replacement: "p. ej.", description: "por ejemplo" },
    { needle: "etc", replacement: "etc.", description: "etcétera" },
    { needle: "vs", replacement: "vs.", description: "versus" },
  ],
  fr: [
    { needle: "ex", replacement: "p. ex.", description: "par exemple" },
    { needle: "cad", replacement: "c.-à-d.", description: "c'est-à-dire" },
    { needle: "etc", replacement: "etc.", description: "et cætera" },
    { needle: "vs", replacement: "vs.", description: "versus" },
  ],
  de: [
    { needle: "zb", replacement: "z. B.", description: "zum Beispiel" },
    { needle: "dh", replacement: "d. h.", description: "das heißt" },
    { needle: "usw", replacement: "usw.", description: "und so weiter" },
    { needle: "etc", replacement: "etc.", description: "et cetera" },
    { needle: "vs", replacement: "vs.", description: "versus" },
  ],
  it: [
    { needle: "es", replacement: "ad es.", description: "ad esempio" },
    { needle: "ecc", replacement: "ecc.", description: "eccetera" },
    { needle: "vs", replacement: "vs.", description: "versus" },
  ],
  pt: [
    { needle: "ex", replacement: "p. ex.", description: "por exemplo" },
    { needle: "etc", replacement: "etc.", description: "etcétera" },
    { needle: "vs", replacement: "vs.", description: "versus" },
  ],
};

interface AbbreviationManagerProps {
  languageCode: string | undefined;
  disabledValue: SettingValue | undefined;
  onUpdateDisabled: (value: SettingValue) => void;
}

export function AbbreviationManager({
  languageCode,
  disabledValue,
  onUpdateDisabled,
}: AbbreviationManagerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const langKey = useMemo(() => {
    if (!languageCode) return "en";
    const prefix = languageCode.split(/[-_]/)[0]?.toLowerCase() ?? "en";
    return ABBREVIATIONS_BY_LANG[prefix] ? prefix : "en";
  }, [languageCode]);

  const abbreviations = useMemo(() => {
    return ABBREVIATIONS_BY_LANG[langKey] ?? ABBREVIATIONS_BY_LANG.en;
  }, [langKey]);

  const disabledList = useMemo<string[]>(() => {
    if (!disabledValue || disabledValue.type !== "TEXT" || !disabledValue.value) {
      return [];
    }
    const raw = disabledValue.value.trim();
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) return parsed.map((item) => String(item).toLowerCase());
      } catch {
        // Fall back to comma-separated
      }
    }
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [disabledValue]);

  const disabledSet = useMemo(() => new Set(disabledList), [disabledList]);

  const toggleAbbreviation = (needle: string) => {
    const lower = needle.toLowerCase();
    const next = new Set(disabledSet);
    if (next.has(lower)) {
      next.delete(lower);
    } else {
      next.add(lower);
    }
    const updated = Array.from(next);
    onUpdateDisabled({
      type: "TEXT",
      value: updated.join(", "),
    });
  };

  const resetAll = () => {
    onUpdateDisabled({
      type: "TEXT",
      value: "",
    });
  };

  const activeCount = abbreviations.length - disabledSet.size;

  return (
    <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3.5 dark:border-stone-800/80 dark:bg-stone-900/40">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Configured abbreviations ({langKey.toUpperCase()})
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/60 px-2 py-0.5 text-[10px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
              {activeCount} of {abbreviations.length} active
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Opt out of any specific automatic expansions below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {disabledSet.size > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-stone-500 hover:bg-stone-200/60 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
              title="Enable all abbreviations"
            >
              <RotateCcw className="size-3" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700/80 transition-colors"
          >
            <span>{isOpen ? "Hide list" : "Manage"}</span>
            <ChevronDown className={cn("size-3.5 transition-transform duration-150", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 divide-y divide-stone-200/60 border-t border-stone-200/60 pt-2 dark:divide-stone-800/60 dark:border-stone-800/60">
          {abbreviations.map((abbr) => {
            const isOptedOut = disabledSet.has(abbr.needle.toLowerCase());

            return (
              <div
                key={abbr.needle}
                className="flex items-center justify-between py-2 first:pt-1 last:pb-1"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded font-mono text-[11px] font-semibold px-1.5 py-0.5 transition-colors",
                        isOptedOut
                          ? "bg-stone-200/50 text-stone-400 line-through dark:bg-stone-800/40 dark:text-stone-500"
                          : "bg-stone-200/80 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                      )}
                    >
                      {abbr.needle}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500">→</span>
                    <span
                      className={cn(
                        "rounded font-mono text-[11px] font-bold px-1.5 py-0.5 transition-colors",
                        isOptedOut
                          ? "bg-stone-100 text-stone-400 dark:bg-stone-800/20 dark:text-stone-500"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      )}
                    >
                      {abbr.replacement}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    {abbr.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAbbreviation(abbr.needle)}
                  role="switch"
                  aria-checked={!isOptedOut}
                  aria-label={`Toggle abbreviation expansion for ${abbr.needle}`}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-default rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                    !isOptedOut ? "bg-[var(--accent)]" : "bg-[var(--surface-sunken-strong)]"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-2xs ring-0 transition duration-200 ease-in-out",
                      !isOptedOut ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
