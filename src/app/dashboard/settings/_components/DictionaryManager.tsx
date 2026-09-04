/**
 * SOURCE OF TRUTH KEYWORDS: DictionaryManager, DictionaryEntry, MatchKind,
 *   createDictionaryEntry, updateDictionaryEntry, deleteDictionaryEntry, usePlan
 * WHAT:  The custom dictionary: add a pattern and its replacement with plan word limits.
 * WHY:   Starter plan includes up to 25 custom jargon words; Pro unlocks unlimited words.
 * WHERE: The vocabulary section of Settings.
 */

import { useCallback, useState, type FormEvent } from "react";
import { Plus, Trash2, Sparkles, BookOpen, Code } from "lucide-react";
import { commands, type DictionaryEntry, type MatchKind } from "@/lib/bindings";
import { unwrapCommand, useCommand } from "@/lib/ipc";
import { ErrorSurface, EmptyState } from "@/components/global";
import { usePlan, getDictionaryWordLimit, canUseDomainPacks } from "@/lib/plan";
import { RepoImporterModal } from "./RepoImporterModal";

const MATCH_LABEL: Readonly<Record<MatchKind, string>> = {
  WORD: "Whole word",
  WORD_CASE_SENSITIVE: "Whole word, case sensitive",
  SUBSTRING: "Anywhere",
};

const MATCH_KINDS: readonly MatchKind[] = ["WORD", "WORD_CASE_SENSITIVE", "SUBSTRING"];
const FIELD_CLASS = "hairline h-8 min-w-0 rounded-input bg-sunken px-2 text-body text-text-primary";

interface DomainPack {
  id: string;
  name: string;
  badge: string;
  description: string;
  entries: { pattern: string; replacement: string }[];
}

const DOMAIN_PACKS: readonly DomainPack[] = [
  {
    id: "frontend-react",
    name: "React, Next.js & Web",
    badge: "Developer",
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

export function DictionaryManager() {
  const entries = useCommand(commands.listDictionary, []);
  const [pattern, setPattern] = useState("");
  const [replacement, setReplacement] = useState("");
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);
  const [repoImporterOpen, setRepoImporterOpen] = useState(false);
  const { tier, startTrial } = usePlan();

  const count = entries.data?.length ?? 0;
  const limit = getDictionaryWordLimit(tier);
  const isLimitReached = count >= limit;
  const hasDomainPackAccess = canUseDomainPacks(tier);

  const add = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (pattern.trim().length === 0 || replacement.trim().length === 0) return;
      if (isLimitReached) {
        startTrial();
        return;
      }
      void unwrapCommand(() =>
        commands.createDictionaryEntry({ pattern, replacement, match_kind: "WORD" }),
      ).then((result) => {
        if (result.status !== "ok") return;
        setPattern("");
        setReplacement("");
        entries.reload();
      });
    },
    [entries, pattern, replacement, isLimitReached, startTrial],
  );

  const installPack = useCallback(
    async (pack: DomainPack) => {
      if (!hasDomainPackAccess) {
        startTrial();
        return;
      }
      setInstallingPackId(pack.id);
      try {
        for (const item of pack.entries) {
          await unwrapCommand(() =>
            commands.createDictionaryEntry({
              pattern: item.pattern,
              replacement: item.replacement,
              match_kind: "WORD",
            }),
          );
        }
        entries.reload();
      } finally {
        setInstallingPackId(null);
      }
    },
    [hasDomainPackAccess, startTrial, entries],
  );

  const update = useCallback(
    (entry: DictionaryEntry, changes: Partial<Pick<DictionaryEntry, "replacement" | "match_kind" | "enabled">>) => {
      void unwrapCommand(() =>
        commands.updateDictionaryEntry({
          id: entry.id,
          replacement: changes.replacement ?? entry.replacement,
          match_kind: changes.match_kind ?? entry.match_kind,
          enabled: changes.enabled ?? entry.enabled,
        }),
      ).then(entries.reload);
    },
    [entries],
  );

  const remove = useCallback(
    (entry: DictionaryEntry) => {
      void unwrapCommand(() => commands.deleteDictionaryEntry({ id: entry.id })).then(entries.reload);
    },
    [entries],
  );

  if (entries.error) return <ErrorSurface error={entries.error} onRetry={entries.reload} size="compact" />;

  return (
    <div className="flex flex-col gap-4">
      {/* Plan Tier Word Limit Bar */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span className="font-mono">
          Custom Jargon Words: <strong className="text-text-primary">{count}</strong> /{" "}
          {limit === Infinity ? "Unlimited (Pro)" : `${limit} (Starter)`}
        </span>
        {isLimitReached && (
          <button
            type="button"
            onClick={startTrial}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-primary hover:underline"
          >
            <Sparkles className="size-3" />
            Upgrade to Pro for Unlimited Words
          </button>
        )}
      </div>

      <RepoImporterModal
        isOpen={repoImporterOpen}
        onClose={() => setRepoImporterOpen(false)}
        onImported={() => entries.reload()}
      />

      {/* Domain-Specific Vocabulary Packs */}
      <div className="hairline rounded-card bg-surface p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-text-secondary" />
            <span className="text-caption font-semibold text-text-primary">
              Developer & Domain Vocabulary Packs
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRepoImporterOpen(true)}
              className="inline-flex items-center gap-1 rounded-input bg-sunken hover:bg-sunken-strong px-2 py-1 text-[11px] font-medium text-text-primary transition-colors"
            >
              <Code className="size-3 text-text-secondary" />
              <span>Import from Codebase…</span>
            </button>
            {!hasDomainPackAccess && (
              <button
                type="button"
                onClick={startTrial}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-text-secondary hover:text-text-primary"
              >
                <Sparkles className="size-3 text-emerald-400" />
                Pro Feature · Start Trial
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DOMAIN_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="hairline rounded-input bg-sunken p-2.5 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption font-semibold text-text-primary">{pack.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface text-text-secondary">
                    {pack.entries.length} terms
                  </span>
                </div>
                <p className="text-[11px] text-text-tertiary line-clamp-2 leading-tight">
                  {pack.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void installPack(pack)}
                disabled={installingPackId === pack.id}
                className="hairline flex h-7 items-center justify-center gap-1.5 rounded-input bg-surface text-caption font-medium text-text-primary transition-colors hover:bg-sunken-strong"
              >
                {hasDomainPackAccess ? (
                  <>
                    <Plus className="size-3" />
                    {installingPackId === pack.id ? "Installing..." : "Add Pack"}
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3 text-emerald-400" />
                    Unlock with Pro
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={add} className="flex items-center gap-2">
        <input
          value={pattern}
          onChange={(event) => setPattern(event.target.value)}
          placeholder="Heard as"
          disabled={isLimitReached}
          className={`${FIELD_CLASS} flex-1`}
        />
        <span className="text-label text-text-tertiary">→</span>
        <input
          value={replacement}
          onChange={(event) => setReplacement(event.target.value)}
          placeholder="Should be"
          disabled={isLimitReached}
          className={`${FIELD_CLASS} flex-1`}
        />
        {isLimitReached ? (
          <button
            type="button"
            onClick={startTrial}
            className="hairline flex h-8 shrink-0 items-center gap-1 rounded-input bg-sunken px-3 text-body font-semibold text-text-primary transition-colors hover:bg-sunken-strong"
          >
            <Sparkles className="size-4" />
            Unlock Pro
          </button>
        ) : (
          <button
            type="submit"
            aria-label="Add dictionary entry"
            className="hairline flex h-8 shrink-0 items-center gap-1 rounded-input bg-sunken px-3 text-body text-text-primary transition-colors hover:bg-sunken-strong"
          >
            <Plus className="size-4" />
            Add
          </button>
        )}
      </form>

      {entries.data && entries.data.length === 0 ? (
        <EmptyState
          size="compact"
          headline="No replacements yet"
          description="Add the words the model keeps getting wrong — names, jargon, product names."
        />
      ) : null}

      <ul className="flex flex-col">
        {(entries.data ?? []).map((entry) => (
          <li key={entry.id} className="hairline-b flex items-center gap-2 py-2 last:border-b-0">
            <input
              type="checkbox"
              checked={entry.enabled}
              aria-label={`Enable ${entry.pattern}`}
              onChange={(event) => update(entry, { enabled: event.target.checked })}
              className="accent-[var(--accent)]"
            />
            <span className="w-40 shrink-0 truncate text-body text-text-secondary">{entry.pattern}</span>
            <input
              defaultValue={entry.replacement}
              aria-label={`Replacement for ${entry.pattern}`}
              onBlur={(event) => {
                if (event.target.value !== entry.replacement) update(entry, { replacement: event.target.value });
              }}
              className={`${FIELD_CLASS} flex-1`}
            />
            <select
              value={entry.match_kind}
              aria-label={`Match kind for ${entry.pattern}`}
              onChange={(event) => {
                const kind = MATCH_KINDS.find((candidate) => candidate === event.target.value);
                if (kind) update(entry, { match_kind: kind });
              }}
              className={FIELD_CLASS}
            >
              {MATCH_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {MATCH_LABEL[kind]}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={`Delete ${entry.pattern}`}
              onClick={() => remove(entry)}
              className="shrink-0 rounded-input p-1 text-text-secondary transition-colors hover:bg-sunken hover:text-danger"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

