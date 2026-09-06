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
import { ErrorSurface, EmptyState, ProFeatureModal } from "@/components/global";
import { usePlan, getDictionaryWordLimit, canUseDomainPacks } from "@/lib/plan";
import { RepoImporterModal } from "./RepoImporterModal";

const MATCH_LABEL: Readonly<Record<MatchKind, string>> = {
  WORD: "Whole word",
  WORD_CASE_SENSITIVE: "Whole word, case sensitive",
  SUBSTRING: "Anywhere",
};

const MATCH_KINDS: readonly MatchKind[] = ["WORD", "WORD_CASE_SENSITIVE", "SUBSTRING"];
const FIELD_CLASS = "hairline h-8 min-w-0 rounded-input bg-sunken px-2 text-body text-text-primary text-stone-900 dark:text-white dark:bg-stone-800/80";

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
      { pattern: "tea rpc", replacement: "tRPC" },
      { pattern: "use state", replacement: "useState" },
      { pattern: "use effect", replacement: "useEffect" },
      { pattern: "use callback", replacement: "useCallback" },
    ],
  },
  {
    id: "backend-rust-go",
    name: "Rust & Systems",
    badge: "Developer",
    description: "whisper cpp, DirectML, WebAssembly, tokio, serde, Cargo, anyhow, arc mutex, axum.",
    entries: [
      { pattern: "whisper c p p", replacement: "whisper.cpp" },
      { pattern: "direct m l", replacement: "DirectML" },
      { pattern: "tokio", replacement: "tokio" },
      { pattern: "sir dee", replacement: "serde" },
      { pattern: "arc mutex", replacement: "Arc<Mutex<T>>" },
      { pattern: "cargo build", replacement: "cargo build" },
    ],
  },
  {
    id: "legal-contract",
    name: "Legal & Corporate",
    badge: "Legal",
    description: "Res judicata, force majeure, indemnity, statutory jurisdiction, privileged work product.",
    entries: [
      { pattern: "force major", replacement: "force majeure" },
      { pattern: "res judicata", replacement: "res judicata" },
      { pattern: "habeas corpus", replacement: "habeas corpus" },
      { pattern: "inter alia", replacement: "inter alia" },
      { pattern: "prima facie", replacement: "prima facie" },
    ],
  },
  {
    id: "clinical-medical",
    name: "Clinical SOAP & Medical",
    badge: "Healthcare",
    description: "Common medications and clinical SOAP shorthand (hypertension, acetaminophen, amoxicillin).",
    entries: [
      { pattern: "h t n", replacement: "HTN (hypertension)" },
      { pattern: "a fib", replacement: "A-fib" },
      { pattern: "acetaminophen", replacement: "acetaminophen" },
      { pattern: "amoxicillin", replacement: "amoxicillin" },
      { pattern: "metformin", replacement: "metformin" },
    ],
  },
];

export function DictionaryManager() {
  const entries = useCommand(commands.listDictionary, []);
  const [pattern, setPattern] = useState("");
  const [replacement, setReplacement] = useState("");
  const [installingPackId, setInstallingPackId] = useState<string | null>(null);
  const [repoImporterOpen, setRepoImporterOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [gatedFeatureName, setGatedFeatureName] = useState("Unlimited Custom Vocabulary");
  const [gatedDescription, setGatedDescription] = useState("");
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
        setGatedFeatureName("Unlimited Custom Vocabulary");
        setGatedDescription("Free starter tier is limited to 25 custom dictionary words. Upgrade to Pro for unlimited custom jargon, client names, and phonetic replacements.");
        setProModalOpen(true);
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
    [entries, pattern, replacement, isLimitReached],
  );

  const installPack = useCallback(
    async (pack: DomainPack) => {
      if (!hasDomainPackAccess) {
        setGatedFeatureName(`${pack.name} Vocabulary Pack`);
        setGatedDescription(`The ${pack.name} pack is part of Murmur Pro domain packs, including specialized phonetic mappings.`);
        setProModalOpen(true);
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
    [hasDomainPackAccess, entries],
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
            onClick={() => {
              setGatedFeatureName("Unlimited Custom Vocabulary");
              setGatedDescription("Free starter tier is limited to 25 custom dictionary words. Upgrade to Pro for unlimited custom jargon, client names, and phonetic replacements.");
              setProModalOpen(true);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-primary hover:underline cursor-pointer"
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
                <option
                  key={kind}
                  value={kind}
                  className="bg-white text-stone-900 dark:bg-[#1c1917] dark:text-stone-100"
                >
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

      <ProFeatureModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName={gatedFeatureName}
        description={gatedDescription}
      />
    </div>
  );
}

