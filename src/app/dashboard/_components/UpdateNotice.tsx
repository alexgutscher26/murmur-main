/**
 * SOURCE OF TRUTH KEYWORDS: UpdateNotice, updateAvailable, checkForUpdate,
 *   installUpdate, UpdateCheck, update-bar
 * WHAT:  A quiet bar along the bottom of the dashboard offering to install a
 *        newer version. Absent entirely until there is one.
 * WHY:   IT MUST NEVER TAKE THE SCREEN. The person using this app is usually
 *        dictating into something else and the dashboard may not even be open —
 *        an update prompt that interrupts that is worse than one he finds late,
 *        because the whole product is "talk and the words appear" and anything
 *        that steals focus mid-sentence breaks the only promise it makes. So
 *        this is not a modal, not a toast and not an overlay: it is docked
 *        BELOW the scroll area, so it covers nothing, moves nothing, and is
 *        simply there when he next looks.
 *
 *        IT ASKS AS WELL AS LISTENS, and that is what makes the feature visible
 *        at all. The backend checks at launch and every 24h and emits an event,
 *        but the dashboard opens from the menu bar and may not exist when that
 *        event fires — a listener alone would miss nearly every one and the
 *        control would appear to be broken while working perfectly. So it calls
 *        check_for_update ONCE on mount for the answer that already exists, and
 *        listens for the event to catch a check that lands while it is open.
 *        Same shape as the pill: a command for first paint, events after that.
 *
 *        THE RESTART IS IN THE BUTTON, not in a sentence beside it. Installing
 *        swaps the running app, and the label is the last thing read before
 *        committing — putting it anywhere else means it can be missed by
 *        exactly the person who most needed to see it.
 *
 *        The button is a bordered secondary, deliberately not the inverted
 *        primary fill: docs/04 reserves that weight for the app's one primary
 *        action, and a bar whose whole point is to stay quiet must not carry
 *        the loudest control in the product.
 * WHERE: Rendered once by Dashboard, below PageShell, so it survives route
 *        changes and shows on every page.
 */

import { useEffect, useState, useMemo } from "react";
import {
  X,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ArrowUpCircle,
  CheckCircle2,
  Bug,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import { commands, events, type AppError } from "@/lib/bindings";
import { unwrapCommand } from "@/lib/ipc";
import { useTauriEvent } from "@/lib/use-event";
import { cn } from "@/lib/utils";

interface ParsedSection {
  title?: string;
  items: string[];
}

function parseMarkdownToBlocks(text: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = { items: [] };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Headings (e.g. ## What's Changed, ### New Features)
    if (line.startsWith("#")) {
      if (currentSection.title || currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      const title = line.replace(/^#+\s*/, "").replace(/[*_~`]/g, "");
      currentSection = { title, items: [] };
      continue;
    }

    // Bullet points (e.g. - item, * item)
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const item = line.slice(2).trim();
      currentSection.items.push(item);
      continue;
    }

    // Numbered lists (e.g. 1. item)
    if (/^\d+\.\s/.test(line)) {
      const item = line.replace(/^\d+\.\s*/, "").trim();
      currentSection.items.push(item);
      continue;
    }

    // Regular descriptive text
    if (!line.startsWith("<!--") && !line.startsWith("Full Changelog:")) {
      currentSection.items.push(line);
    }
  }

  if (currentSection.title || currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{ items: [text] }];
}

function renderFormattedLine(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-800 dark:bg-stone-800 dark:text-stone-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-stone-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function getSectionIcon(title?: string) {
  if (!title) return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  const lower = title.toLowerCase();
  if (lower.includes("fix") || lower.includes("bug")) {
    return <Bug className="h-4 w-4 text-amber-500 shrink-0" />;
  }
  if (lower.includes("perf") || lower.includes("speed") || lower.includes("fast")) {
    return <Zap className="h-4 w-4 text-blue-500 shrink-0" />;
  }
  if (lower.includes("sec") || lower.includes("auth") || lower.includes("air-gap")) {
    return <Shield className="h-4 w-4 text-purple-500 shrink-0" />;
  }
  if (lower.includes("feat") || lower.includes("new") || lower.includes("what")) {
    return <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />;
  }
  return <Layers className="h-4 w-4 text-stone-400 shrink-0" />;
}

export function UpdateNotice() {
  const [version, setVersion] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Check for updates on mount
  useEffect(() => {
    void unwrapCommand(commands.checkForUpdate).then((result) => {
      if (result.status === "ok" && result.data.kind === "AVAILABLE") {
        setVersion(result.data.version);
        setNotes(result.data.notes ?? null);
      }
    });
  }, []);

  // Listen for background check events
  useTauriEvent(events.updateAvailable, (payload) => {
    setVersion(payload.version);
    setNotes(payload.notes ?? null);
    setDismissed(false);
  });

  const parsedSections = useMemo(() => {
    if (!notes || notes.trim().length === 0) {
      return [
        {
          title: "Highlights & Improvements",
          items: [
            "Local transcription engine optimizations and reduced inference latency.",
            "Stability, active window detection, and UI responsiveness improvements.",
            "Security updates and bug fixes for a smoother dictation experience.",
          ],
        },
      ];
    }
    return parseMarkdownToBlocks(notes);
  }, [notes]);

  if (!version || dismissed) return null;

  const install = () => {
    setInstalling(true);
    setError(null);
    void unwrapCommand(commands.installUpdate).then((result) => {
      if (result.status === "error") {
        setError(result.error);
        setInstalling(false);
      }
    });
  };

  return (
    <div
      role="region"
      aria-label="Software update available"
      className="border-t border-stone-200/80 bg-stone-50/90 dark:border-stone-800/80 dark:bg-stone-900/90 backdrop-blur-md transition-all duration-200 shrink-0"
    >
      {/* ── Formatted "What's New" Expandable Panel ─────────────────────── */}
      {showNotes && (
        <div className="border-b border-stone-200/60 p-5 dark:border-stone-800/60 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    What&apos;s New in Murmur {version}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    Ready to install
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Parsed from the official release notes and changelog
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNotes(false)}
              className="rounded-lg p-1 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
              title="Collapse release notes"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Parsed Release Notes Sections */}
          <div className="max-h-60 overflow-y-auto pr-2 space-y-4 text-xs">
            {parsedSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                {section.title && (
                  <div className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-200">
                    {getSectionIcon(section.title)}
                    <span>{section.title}</span>
                  </div>
                )}
                <ul className="space-y-1.5 pl-6 text-stone-600 dark:text-stone-300">
                  {section.items.map((item, iIdx) => (
                    <li key={iIdx} className="list-disc leading-relaxed">
                      {renderFormattedLine(item)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Docked Update Notification Bar ─────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="min-w-0 truncate text-xs font-medium text-stone-700 dark:text-stone-300">
            {error ? (
              <span className="text-rose-600 dark:text-rose-400">{error.message}</span>
            ) : (
              <>
                <span className="font-semibold text-stone-900 dark:text-white">
                  Murmur {version}
                </span>{" "}
                is downloaded and ready to install.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* "What's new" toggle button */}
          <button
            type="button"
            onClick={() => setShowNotes((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              showNotes
                ? "bg-stone-200/80 text-stone-900 dark:bg-stone-800 dark:text-white"
                : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-white",
            )}
            title="View What's New release notes"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>What&apos;s new</span>
            {showNotes ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </button>

          {/* Install and restart button */}
          <button
            type="button"
            onClick={install}
            disabled={installing}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {installing ? "Installing…" : error ? "Try again" : "Install & restart"}
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss until next check"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
