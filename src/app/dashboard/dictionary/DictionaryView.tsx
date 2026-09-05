/**
 * SOURCE OF TRUTH KEYWORDS: DictionaryView, CustomVocabulary, MurmurSpellsTheWayYouDo,
 *   DictionaryEntry, AddWordModal, EditWordModal
 * WHAT:  Dedicated Murmur Dictionary view:
 *        - Top bar with title "Dictionary" and "Add new" button
 *        - Tabs for "All", "Personal", and "Shared with team" with search, sort, and refresh
 *        - Ambient bokeh hero banner: "Murmur spells the way you do." with sample tags
 *        - Clean, responsive vocabulary card list with AI sparkle icons and hover actions
 *        - Full CRUD support synced to Murmur's SQLite dictionary backend
 * WHERE: Rendered by Dashboard.tsx on route === "dictionary".
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  RotateCw,
  X,
  Pencil,
  Trash2,
  Star,
  Plus,
  Check,
  Users,
  User,
  Info,
  BookOpen,
  Code,
  Sparkles,
} from "lucide-react";
import {
  commands,
  type DictionaryEntry,
  type MatchKind,
} from "@/lib/bindings";
import { unwrapCommand, useCommand } from "@/lib/ipc";
import { cn } from "@/lib/utils";
import { Skeleton, ErrorSurface } from "@/components/global";
import { usePlan, getDictionaryWordLimit, canUseDomainPacks } from "@/lib/plan";
import { RepoImporterModal } from "../settings/_components/RepoImporterModal";

// ─── Domain Vocabulary Packs ────────────────────────────────────────────────

export interface DomainPack {
  id: string;
  name: string;
  badge: string;
  badgeType: "developer" | "pro";
  description: string;
  entries: { pattern: string; replacement: string }[];
}

export const DOMAIN_PACKS: readonly DomainPack[] = [
  {
    id: "frontend-react",
    name: "React, Next.js & Web",
    badge: "Developer",
    badgeType: "developer",
    description: "Next.js, TypeScript, Tailwind CSS, Zustand, TanStack Query, tRPC, Vite, useEffect, useState.",
    entries: [
      { pattern: "next js", replacement: "Next.js" },
      { pattern: "type script", replacement: "TypeScript" },
      { pattern: "tailwind css", replacement: "Tailwind CSS" },
      { pattern: "zoo stand", replacement: "Zustand" },
      { pattern: "tan stack query", replacement: "TanStack Query" },
      { pattern: "t r p c", replacement: "tRPC" },
      { pattern: "use effect", replacement: "useEffect" },
      { pattern: "use state", replacement: "useState" },
      { pattern: "use callback", replacement: "useCallback" },
      { pattern: "use memo", replacement: "useMemo" },
    ],
  },
  {
    id: "backend-systems",
    name: "Backend, Python & Rust",
    badge: "Developer",
    badgeType: "developer",
    description: "FastAPI, PyTorch, PostgreSQL, SQLite, Prisma, Docker, Tokio, Cargo, Serde, async/await.",
    entries: [
      { pattern: "fast a p i", replacement: "FastAPI" },
      { pattern: "pie torch", replacement: "PyTorch" },
      { pattern: "post gres", replacement: "PostgreSQL" },
      { pattern: "sequel lite", replacement: "SQLite" },
      { pattern: "prisma", replacement: "Prisma" },
      { pattern: "tokyo", replacement: "Tokio" },
      { pattern: "cube nettes", replacement: "Kubernetes" },
      { pattern: "a sync", replacement: "async" },
      { pattern: "a wait", replacement: "await" },
    ],
  },
  {
    id: "cloud-devops",
    name: "Git, DevOps & Cloud",
    badge: "Developer",
    badgeType: "developer",
    description: "GitHub Actions, CI/CD, Terraform, Cloudflare Workers, AWS, Kubernetes, pull request, merge conflict.",
    entries: [
      { pattern: "git hub actions", replacement: "GitHub Actions" },
      { pattern: "c i c d", replacement: "CI/CD" },
      { pattern: "terra form", replacement: "Terraform" },
      { pattern: "cloud flare workers", replacement: "Cloudflare Workers" },
      { pattern: "pull request", replacement: "PR" },
      { pattern: "a p i endpoint", replacement: "API endpoint" },
      { pattern: "web hook", replacement: "webhook" },
    ],
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    badge: "Pro",
    badgeType: "pro",
    description: "Force majeure, indemnification, jurisdiction, GDPR, HIPAA, affidavit, subpoena, non-disclosure.",
    entries: [
      { pattern: "force major", replacement: "force majeure" },
      { pattern: "g d p r", replacement: "GDPR" },
      { pattern: "hipaa", replacement: "HIPAA" },
      { pattern: "n d a", replacement: "NDA" },
      { pattern: "affidavit", replacement: "affidavit" },
      { pattern: "indemnification", replacement: "indemnification" },
      { pattern: "sub poena", replacement: "subpoena" },
    ],
  },
  {
    id: "sales",
    name: "Sales & Executive",
    badge: "Pro",
    badgeType: "pro",
    description: "ARR, MRR, churn rate, SLA, pipeline velocity, CAC, LTV, quarterly touchpoints.",
    entries: [
      { pattern: "a r r", replacement: "ARR" },
      { pattern: "m r r", replacement: "MRR" },
      { pattern: "s l a", replacement: "SLA" },
      { pattern: "c a c", replacement: "CAC" },
      { pattern: "l t v", replacement: "LTV" },
      { pattern: "touch points", replacement: "touchpoints" },
    ],
  },
];

// ─── Initial Demo Words ──────────────────────────────────────────────────────

interface WordMetadata {
  sparkle?: boolean;
  starred?: boolean;
  scope?: "personal" | "team";
}

const SEED_TERMS = [
  { pattern: "supabase", replacement: "supabase", sparkle: true, scope: "personal" as const },
  { pattern: "workinbox69@gmail.com", replacement: "workinbox69@gmail.com", sparkle: false, scope: "personal" as const },
  { pattern: "Alex Gutscher", replacement: "Alex Gutscher", sparkle: false, scope: "personal" as const },
  { pattern: "expo", replacement: "expo", sparkle: true, scope: "personal" as const },
  { pattern: "stackauth", replacement: "stackauth", sparkle: true, scope: "personal" as const },
  { pattern: "questHow", replacement: "questHow", sparkle: true, scope: "personal" as const },
  { pattern: "etsy", replacement: "etsy", sparkle: true, scope: "personal" as const },
];

const SUGGESTED_CHIPS = ["Murmur", "Samir", "Sara", "Karol", "Spyder"];

const SEED_FALLBACK: DictionaryEntry[] = SEED_TERMS.map((term, index) => ({
  id: -(index + 1),
  pattern: term.pattern,
  replacement: term.replacement,
  match_kind: "WORD",
  enabled: true,
  used_at: null,
}));

const METADATA_STORAGE_KEY = "murmur_dictionary_meta_v1";
const BANNER_DISMISSED_KEY = "murmur_dict_banner_dismissed_v1";

function loadLocalMeta(): Record<string, WordMetadata> {
  try {
    const raw = localStorage.getItem(METADATA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalMeta(meta: Record<string, WordMetadata>) {
  try {
    localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // ignore local storage errors
  }
}

// ─── Sparkle Icon Component (matches screenshot golden star) ─────────────────

function GoldenSparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("inline-block shrink-0", className)}
    >
      <path
        d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
        fill="url(#sparkle-gradient)"
      />
      <defs>
        <linearGradient id="sparkle-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Main DictionaryView Component ──────────────────────────────────────────

export function DictionaryView() {
  const entries = useCommand(commands.listDictionary, []);
  const [activeTab, setActiveTab] = useState<"all" | "personal" | "team" | "packs">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"default" | "az" | "za" | "starred">("default");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Plan tier word limits & domain pack access (Starter: 25 words, Pro: unlimited)
  const { tier, startTrial } = usePlan();
  const count = entries.data?.length ?? 0;
  const limit = getDictionaryWordLimit(tier);
  const isLimitReached = count >= limit;
  const hasDomainPackAccess = canUseDomainPacks(tier);

  // Importer & Domain pack installation states
  const [repoImporterOpen, setRepoImporterOpen] = useState(false);
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);

  const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [meta, setMeta] = useState<Record<string, WordMetadata>>(loadLocalMeta);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);
  const [prefilledTerm, setPrefilledTerm] = useState<string>("");

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  }, []);

  const installPack = useCallback(
    async (pack: DomainPack) => {
      if (!hasDomainPackAccess) {
        startTrial();
        return;
      }
      setInstallingPackId(pack.id);
      try {
        const newMeta = { ...meta };
        let addedCount = 0;
        for (const item of pack.entries) {
          try {
            await unwrapCommand(() =>
              commands.createDictionaryEntry({
                pattern: item.pattern,
                replacement: item.replacement,
                match_kind: "WORD",
              }),
            );
            newMeta[item.replacement] = {
              sparkle: true,
              scope: "personal",
              starred: false,
            };
            addedCount++;
          } catch {
            // ignore duplicate terms
          }
        }
        saveLocalMeta(newMeta);
        setMeta(newMeta);
        showToast(`Installed "${pack.name}" (${addedCount} terms)`);
        entries.reload();
      } finally {
        setInstallingPackId(null);
      }
    },
    [hasDomainPackAccess, startTrial, meta, entries, showToast],
  );

  const isPackInstalled = useCallback(
    (pack: DomainPack) => {
      if (!entries.data || entries.data.length === 0) return false;
      const dictWords = new Set(entries.data.map((e) => e.replacement.toLowerCase()));
      return pack.entries.every((e) => dictWords.has(e.replacement.toLowerCase()));
    },
    [entries.data],
  );

  // Auto-seed initial terms if dictionary is completely empty on first launch
  useEffect(() => {
    if (entries.data && entries.data.length === 0) {
      const seededFlag = localStorage.getItem("murmur_dict_auto_seeded");
      if (!seededFlag) {
        localStorage.setItem("murmur_dict_auto_seeded", "true");
        (async () => {
          const newMeta = { ...meta };
          for (const item of SEED_TERMS) {
            try {
              await unwrapCommand(() =>
                commands.createDictionaryEntry({
                  pattern: item.pattern,
                  replacement: item.replacement,
                  match_kind: "WORD",
                }),
              );
              newMeta[item.replacement] = {
                sparkle: item.sparkle,
                scope: item.scope,
                starred: false,
              };
            } catch {
              // ignore duplicate or creation error
            }
          }
          saveLocalMeta(newMeta);
          setMeta(newMeta);
          entries.reload();
        })();
      }
    }
  }, [entries.data, entries, meta]);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
  };

  const handleRestoreBanner = () => {
    setBannerDismissed(false);
    try {
      localStorage.removeItem(BANNER_DISMISSED_KEY);
    } catch {
      // ignore
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await entries.reload();
      showToast("Dictionary updated");
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const toggleStar = (term: string) => {
    setMeta((prev) => {
      const current = prev[term] || {};
      const updated = {
        ...prev,
        [term]: {
          ...current,
          starred: !current.starred,
        },
      };
      saveLocalMeta(updated);
      return updated;
    });
  };

  const handleDelete = async (entry: DictionaryEntry) => {
    try {
      if (entry.id > 0) {
        await unwrapCommand(() => commands.deleteDictionaryEntry({ id: entry.id }));
      }
      showToast(`Removed "${entry.replacement || entry.pattern}"`);
      entries.reload();
    } catch (e: any) {
      showToast(`Failed to delete: ${e?.message ?? "Error"}`);
    }
  };

  const handleQuickAddChip = async (chip: string) => {
    if (isLimitReached) {
      showToast("Word limit reached. Upgrade to Pro for unlimited words.");
      startTrial();
      return;
    }

    const existing = (entries.data ?? []).some(
      (e) => e.replacement.toLowerCase() === chip.toLowerCase() || e.pattern.toLowerCase() === chip.toLowerCase()
    );
    if (existing) {
      showToast(`"${chip}" is already in your dictionary`);
      return;
    }

    try {
      await unwrapCommand(() =>
        commands.createDictionaryEntry({
          pattern: chip,
          replacement: chip,
          match_kind: "WORD",
        })
      );
      setMeta((prev) => {
        const updated = {
          ...prev,
          [chip]: { sparkle: true, scope: "personal" as const },
        };
        saveLocalMeta(updated);
        return updated;
      });
      showToast(`Added "${chip}" to your dictionary!`);
      entries.reload();
    } catch {
      // If error, open modal to let user configure
      setPrefilledTerm(chip);
      setAddModalOpen(true);
    }
  };

  const cycleSort = () => {
    setSortMode((prev) => {
      if (prev === "default") return "az";
      if (prev === "az") return "za";
      if (prev === "za") return "starred";
      return "default";
    });
    const nextMode =
      sortMode === "default"
        ? "Alphabetical (A-Z)"
        : sortMode === "az"
        ? "Alphabetical (Z-A)"
        : sortMode === "za"
        ? "Favorites first"
        : "Default order";
    showToast(`Sorted: ${nextMode}`);
  };

  // Filtered & Sorted Entries
  const displayedEntries = useMemo(() => {
    const dataList = entries.data ?? [];
    let list = dataList.length > 0 ? [...dataList] : [...SEED_FALLBACK];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.replacement.toLowerCase().includes(q) ||
          e.pattern.toLowerCase().includes(q)
      );
    }

    // Filter by tab
    if (activeTab === "personal") {
      list = list.filter((e) => {
        const itemMeta = meta[e.replacement] || meta[e.pattern] || {};
        return itemMeta.scope !== "team";
      });
    } else if (activeTab === "team") {
      list = list.filter((e) => {
        const itemMeta = meta[e.replacement] || meta[e.pattern] || {};
        return itemMeta.scope === "team";
      });
    }

    // Sort
    if (sortMode === "az") {
      list.sort((a, b) =>
        a.replacement.localeCompare(b.replacement, undefined, { sensitivity: "base" })
      );
    } else if (sortMode === "za") {
      list.sort((a, b) =>
        b.replacement.localeCompare(a.replacement, undefined, { sensitivity: "base" })
      );
    } else if (sortMode === "starred") {
      list.sort((a, b) => {
        const aStarred = meta[a.replacement]?.starred || meta[a.pattern]?.starred ? 1 : 0;
        const bStarred = meta[b.replacement]?.starred || meta[b.pattern]?.starred ? 1 : 0;
        return bStarred - aStarred;
      });
    }

    return list;
  }, [entries.data, searchQuery, activeTab, sortMode, meta]);

  if (entries.error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <ErrorSurface error={entries.error} onRetry={entries.reload} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-white dark:bg-[#1b1917] px-8 py-7 select-text">
      {/* ── Toast Feedback ─────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-8 z-50 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 dark:bg-white dark:text-stone-900 flex items-center gap-2">
          <Check className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-4xl flex flex-col gap-5">
        {/* ── Top Header Row ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Dictionary
            </h1>
            <div className="flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-stone-50 px-2.5 py-1 text-[11px] font-mono text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
              <span>Words:</span>
              <strong className="text-stone-900 dark:text-white">{count}</strong>
              <span>/</span>
              <span>{limit === Infinity ? "Unlimited (Pro)" : `${limit} (Starter)`}</span>
            </div>
            {isLimitReached && (
              <button
                type="button"
                onClick={startTrial}
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition-colors"
              >
                <Sparkles className="size-3 text-amber-500" />
                <span>Unlock Pro</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRepoImporterOpen(true)}
              title="Import symbols and dependencies from a codebase"
              className="flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:bg-stone-800 transition-all active:scale-[0.98]"
            >
              <Code className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
              <span>Import Codebase…</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "packs" ? "all" : "packs")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.98]",
                activeTab === "packs"
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-800 dark:text-amber-200 shadow-xs"
                  : "border-stone-200/80 bg-stone-50/80 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:bg-stone-800"
              )}
            >
              <BookOpen className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
              <span>Vocabulary Packs</span>
              <span className="rounded-full bg-stone-200/70 dark:bg-stone-800 px-1.5 py-0.2 text-[10px] font-mono">
                {DOMAIN_PACKS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isLimitReached) {
                  startTrial();
                  return;
                }
                setPrefilledTerm("");
                setAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition-all active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add new</span>
            </button>
          </div>
        </div>

        {/* ── Tabs & Filter/Action Toolbar ─────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800/80">
            {/* Left Tabs */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "pb-2.5 text-xs font-medium transition-colors relative",
                  activeTab === "all"
                    ? "text-stone-900 dark:text-white font-semibold"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                )}
              >
                All
                {activeTab === "all" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900 dark:bg-white rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={cn(
                  "pb-2.5 text-xs font-medium transition-colors relative",
                  activeTab === "personal"
                    ? "text-stone-900 dark:text-white font-semibold"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                )}
              >
                Personal
                {activeTab === "personal" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900 dark:bg-white rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("team")}
                className={cn(
                  "pb-2.5 text-xs font-medium transition-colors relative",
                  activeTab === "team"
                    ? "text-stone-900 dark:text-white font-semibold"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                )}
              >
                Shared with team
                {activeTab === "team" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900 dark:bg-white rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("packs")}
                className={cn(
                  "pb-2.5 text-xs font-medium transition-colors relative flex items-center gap-1.5",
                  activeTab === "packs"
                    ? "text-stone-900 dark:text-white font-semibold"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                )}
              >
                <span>Vocabulary Packs</span>
                <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-1.5 py-0.2 text-[10px] font-mono text-stone-600 dark:text-stone-300">
                  {DOMAIN_PACKS.length}
                </span>
                {activeTab === "packs" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900 dark:bg-white rounded-full" />
                )}
              </button>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 pb-2">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                title="Search dictionary"
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  searchOpen || searchQuery
                    ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-white"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                )}
              >
                <Search className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={cycleSort}
                title={`Sort words (${sortMode})`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh entries"
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors",
                  isRefreshing && "animate-spin text-stone-700 dark:text-stone-200"
                )}
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Expandable Search Input */}
          {searchOpen && (
            <div className="flex items-center gap-2 px-1 pt-1 animate-in fade-in slide-in-from-top-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter dictionary words or heard-as patterns..."
                  autoFocus
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Tab Content: Vocabulary Packs vs Dictionary Word List ──── */}
        {activeTab === "packs" ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-1">
            {/* Domain Packs Header & Pro Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/60 p-5 dark:border-stone-800/80 dark:bg-stone-900/40">
              <div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="size-4 text-stone-600 dark:text-stone-300" />
                  <span>Curated Developer & Domain Vocabulary Packs</span>
                </h3>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed">
                  1-click install specialized vocabulary sets for web frameworks, backend systems, DevOps pipelines, legal contracts, and SaaS metrics.
                </p>
              </div>

              {!hasDomainPackAccess && (
                <button
                  type="button"
                  onClick={startTrial}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
                >
                  <Sparkles className="size-3.5" />
                  <span>Start Pro Trial for Packs</span>
                </button>
              )}
            </div>

            {/* Grid of Domain Packs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {DOMAIN_PACKS.map((pack) => {
                const installed = isPackInstalled(pack);
                const isInstalling = installingPackId === pack.id;

                return (
                  <div
                    key={pack.id}
                    className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-4.5 dark:border-stone-800/80 dark:bg-[#161412] shadow-xs hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-stone-900 dark:text-white">
                            {pack.name}
                          </h4>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-mono font-medium",
                              pack.badgeType === "pro"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                                : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50"
                            )}
                          >
                            {pack.badge}
                          </span>
                        </div>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                          {pack.entries.length} terms
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                        {pack.description}
                      </p>

                      {/* Term chips preview */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {pack.entries.map((item) => (
                          <span
                            key={item.replacement}
                            className="rounded-md border border-stone-200/60 bg-stone-50/80 px-2 py-0.5 text-[10px] font-mono text-stone-700 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300"
                          >
                            {item.replacement}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">
                        {installed ? "All terms installed" : `${pack.entries.length} replacements`}
                      </span>

                      <button
                        type="button"
                        onClick={() => void installPack(pack)}
                        disabled={installed || isInstalling}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95",
                          installed
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 cursor-default"
                            : hasDomainPackAccess
                            ? "bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white shadow-xs"
                            : "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                        )}
                      >
                        {installed ? (
                          <>
                            <Check className="size-3.5 stroke-[2.5]" />
                            <span>Installed</span>
                          </>
                        ) : isInstalling ? (
                          <>
                            <RotateCw className="size-3.5 animate-spin" />
                            <span>Installing…</span>
                          </>
                        ) : hasDomainPackAccess ? (
                          <>
                            <Plus className="size-3.5 stroke-[2.5]" />
                            <span>Add Pack</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Unlock with Pro</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* ── Ambient Bokeh Hero Banner ─────────────────────────────────── */}
            {!bannerDismissed && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4d3326] via-[#332219] to-[#1c120c] p-7 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 border border-[#5d4032]/40">
                {/* Ambient Background Glows */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-600/20 blur-3xl" />
                <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-orange-700/15 blur-2xl" />

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  title="Dismiss banner"
                  className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Banner Headline in Serif */}
                <h2 className="font-serif text-2xl md:text-3xl font-normal text-stone-100 tracking-tight">
                  Murmur spells the way <span className="italic font-serif">you</span> do.
                </h2>

                {/* Banner Description */}
                <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-stone-300/90">
                  Murmur learns your unique words and names — automatically or manually.{" "}
                  <strong className="font-semibold text-white">
                    Add personal terms, company jargon, client names, or industry-specific lingo.
                  </strong>{" "}
                  Share them with your team so everyone stays on the same page.
                </p>

                {/* Action Chips */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isLimitReached) {
                        startTrial();
                        return;
                      }
                      setPrefilledTerm("");
                      setAddModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-stone-900 shadow-xs hover:bg-stone-100 transition-colors active:scale-95"
                  >
                    <span>Add new word</span>
                  </button>

                  {SUGGESTED_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleQuickAddChip(chip)}
                      title={`Add "${chip}" to dictionary`}
                      className="rounded-full border border-white/10 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-stone-200 backdrop-blur-sm hover:bg-white/25 hover:text-white transition-all active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Vocabulary Packs Promotion Bar */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200/70 bg-stone-50/70 px-4 py-2.5 text-xs dark:border-stone-800/70 dark:bg-stone-900/40">
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <BookOpen className="size-3.5 text-stone-400" />
                <span>Looking for curated web stacks, Rust, DevOps, or legal packs?</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("packs")}
                className="font-medium text-stone-900 dark:text-white underline hover:opacity-80 transition-opacity"
              >
                Browse {DOMAIN_PACKS.length} Domain Packs →
              </button>
            </div>

            {/* Small collapsed banner pill if dismissed */}
            {bannerDismissed && (
              <div className="flex items-center justify-between px-1 text-xs text-stone-400 dark:text-stone-500">
                <span className="text-[11px]">
                  {displayedEntries.length} custom vocabulary term{displayedEntries.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={handleRestoreBanner}
                  className="flex items-center gap-1 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  <Info className="h-3 w-3" />
                  <span>Show dictionary guide</span>
                </button>
              </div>
            )}

            {/* ── Dictionary Items Card List ────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800/80 dark:bg-[#161412] shadow-xs divide-y divide-stone-100 dark:divide-stone-800/50">
              {entries.loading && displayedEntries.length === 0 ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              ) : displayedEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    {searchQuery
                      ? "No terms match your search"
                      : activeTab === "team"
                      ? "No team shared words yet"
                      : "No words in dictionary"}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                    {searchQuery
                      ? `Clear your query "${searchQuery}" or add this term as a new replacement.`
                      : activeTab === "team"
                      ? "Share custom jargon and acronyms with your entire team so everyone stays aligned."
                      : "Add your first unique term, name, or company jargon above."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (isLimitReached) {
                        startTrial();
                        return;
                      }
                      setPrefilledTerm(searchQuery);
                      setAddModalOpen(true);
                    }}
                    className="mt-4 flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add new word</span>
                  </button>
                </div>
              ) : (
                displayedEntries.map((entry) => {
                  const term = entry.replacement || entry.pattern;
                  const itemMeta = meta[entry.replacement] || meta[entry.pattern] || {};
                  // Sparkle is true if marked in metadata, or pattern/replacement matches tech names
                  const hasSparkle = itemMeta.sparkle ?? (
                    entry.pattern.toLowerCase() === "supabase" ||
                    entry.pattern.toLowerCase() === "expo" ||
                    entry.pattern.toLowerCase() === "stackauth" ||
                    entry.pattern.toLowerCase() === "questhow" ||
                    entry.pattern.toLowerCase() === "etsy"
                  );
                  const isStarred = !!itemMeta.starred;

                  return (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-stone-50/80 dark:hover:bg-stone-800/40"
                    >
                      {/* Left: Term text + Sparkle icon */}
                      <div className="flex items-center gap-2 min-w-0 pr-4">
                        <span className="text-xs font-medium text-stone-800 dark:text-stone-200 select-text truncate">
                          {term}
                        </span>
                        {hasSparkle && (
                          <GoldenSparkleIcon className="h-3.5 w-3.5 drop-shadow-xs" />
                        )}
                        {entry.pattern !== entry.replacement && (
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                            (heard as: {entry.pattern})
                          </span>
                        )}
                        {itemMeta.scope === "team" && (
                          <span className="rounded-md bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 text-[10px] text-stone-500 font-medium flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" />
                            Team
                          </span>
                        )}
                      </div>

                      {/* Right: Hover action icons (Edit, Delete, Star) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setEditingEntry(entry)}
                          title="Edit word"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-200/60 hover:text-stone-800 dark:hover:bg-stone-700/60 dark:hover:text-stone-200 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          title="Delete word"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStar(term)}
                          title={isStarred ? "Remove star" : "Star word"}
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                            isStarred
                              ? "text-amber-500 hover:text-amber-600"
                              : "text-stone-400 hover:bg-stone-200/60 hover:text-amber-500 dark:hover:bg-stone-700/60"
                          )}
                        >
                          <Star
                            className={cn(
                              "h-3.5 w-3.5",
                              isStarred && "fill-amber-400 text-amber-500"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Codebase Repo Importer Modal ───────────────────────────────── */}
      <RepoImporterModal
        isOpen={repoImporterOpen}
        onClose={() => setRepoImporterOpen(false)}
        onImported={() => {
          entries.reload();
          showToast("Imported symbols from repository into dictionary!");
        }}
      />

      {/* ── Add Word Modal ────────────────────────────────────────────── */}
      {addModalOpen && (
        <WordModal
          title="Add Word to Dictionary"
          submitLabel="Add word"
          initialTerm={prefilledTerm}
          isLimitReached={isLimitReached}
          onUpgrade={startTrial}
          onClose={() => {
            setAddModalOpen(false);
            setPrefilledTerm("");
          }}
          onSave={async ({ word, heardAs, matchKind, isSparkle, scope }) => {
            if (isLimitReached) {
              startTrial();
              return;
            }
            await unwrapCommand(() =>
              commands.createDictionaryEntry({
                pattern: heardAs || word,
                replacement: word,
                match_kind: matchKind,
              })
            );
            setMeta((prev) => {
              const updated = {
                ...prev,
                [word]: { sparkle: isSparkle, scope, starred: false },
              };
              saveLocalMeta(updated);
              return updated;
            });
            showToast(`Added "${word}"`);
            entries.reload();
            setAddModalOpen(false);
          }}
        />
      )}

      {/* ── Edit Word Modal ───────────────────────────────────────────── */}
      {editingEntry && (
        <WordModal
          title="Edit Dictionary Term"
          submitLabel="Save changes"
          initialTerm={editingEntry.replacement}
          initialHeardAs={editingEntry.pattern}
          initialMatchKind={editingEntry.match_kind}
          initialSparkle={meta[editingEntry.replacement]?.sparkle ?? true}
          initialScope={meta[editingEntry.replacement]?.scope ?? "personal"}
          onClose={() => setEditingEntry(null)}
          onSave={async ({ word, matchKind, isSparkle, scope }) => {
            await unwrapCommand(() =>
              commands.updateDictionaryEntry({
                id: editingEntry.id,
                replacement: word,
                match_kind: matchKind,
                enabled: true,
              })
            );
            setMeta((prev) => {
              const updated = {
                ...prev,
                [word]: {
                  ...prev[editingEntry.replacement],
                  sparkle: isSparkle,
                  scope,
                },
              };
              saveLocalMeta(updated);
              return updated;
            });
            showToast(`Updated "${word}"`);
            entries.reload();
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Modal Dialog Component for Adding & Editing Terms ───────────────────────

interface WordModalProps {
  title: string;
  submitLabel: string;
  initialTerm?: string;
  initialHeardAs?: string;
  initialMatchKind?: MatchKind;
  initialSparkle?: boolean;
  initialScope?: "personal" | "team";
  isLimitReached?: boolean;
  onUpgrade?: () => void;
  onClose: () => void;
  onSave: (data: {
    word: string;
    heardAs: string;
    matchKind: MatchKind;
    isSparkle: boolean;
    scope: "personal" | "team";
  }) => Promise<void>;
}

function WordModal({
  title,
  submitLabel,
  initialTerm = "",
  initialHeardAs = "",
  initialMatchKind = "WORD",
  initialSparkle = true,
  initialScope = "personal",
  isLimitReached = false,
  onUpgrade,
  onClose,
  onSave,
}: WordModalProps) {
  const [word, setWord] = useState(initialTerm);
  const [heardAs, setHeardAs] = useState(initialHeardAs);
  const [matchKind, setMatchKind] = useState<MatchKind>(initialMatchKind);
  const [isSparkle, setIsSparkle] = useState(initialSparkle);
  const [scope, setScope] = useState<"personal" | "team">(initialScope);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      setError("Please enter a word or phrase.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        word: word.trim(),
        heardAs: heardAs.trim(),
        matchKind,
        isSparkle,
        scope,
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to save word.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-[#1c1a17]">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800/80">
          <h2 className="text-base font-bold text-stone-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          {isLimitReached && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="truncate">Starter plan limited to 25 custom words.</span>
              </div>
              {onUpgrade && (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="shrink-0 rounded-lg bg-amber-600 px-2.5 py-1 font-semibold text-white hover:bg-amber-700 transition-colors"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          )}

          {/* Word Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Word or phrase (Should be)
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. Supabase, Alex Gutscher, Murmur"
              autoFocus
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Sounds Like / Heard As Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Heard as / Spoken phonetically{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              type="text"
              value={heardAs}
              onChange={(e) => setHeardAs(e.target.value)}
              placeholder="Leave empty to match the word itself"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Dictionary Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope("personal")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition-colors",
                  scope === "personal"
                    ? "border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-900"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                )}
              >
                <User className="h-3.5 w-3.5" />
                <span>Personal</span>
              </button>
              <button
                type="button"
                onClick={() => setScope("team")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition-colors",
                  scope === "team"
                    ? "border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-900"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Shared with team</span>
              </button>
            </div>
          </div>

          {/* Match Mode */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Matching Behavior
            </label>
            <select
              value={matchKind}
              onChange={(e) => setMatchKind(e.target.value as MatchKind)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 focus:border-stone-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            >
              <option value="WORD">Whole word (recommended)</option>
              <option value="WORD_CASE_SENSITIVE">Whole word (case sensitive)</option>
              <option value="SUBSTRING">Anywhere (substring)</option>
            </select>
          </div>

          {/* AI Sparkle Badge Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <GoldenSparkleIcon className="h-4 w-4" />
              <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                Mark as smart-detected term
              </span>
            </div>
            <input
              type="checkbox"
              checked={isSparkle}
              onChange={(e) => setIsSparkle(e.target.checked)}
              className="h-4 w-4 rounded accent-amber-600"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isLimitReached}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition-colors disabled:opacity-50"
            >
              {isSaving && <RotateCw className="h-3.5 w-3.5 animate-spin" />}
              <span>{submitLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
