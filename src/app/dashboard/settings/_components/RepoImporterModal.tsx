/**
 * SOURCE OF TRUTH KEYWORDS: RepoImporterModal, extract_symbols, codebase_glossary, developer_vocabulary
 * WHAT:  Extracts custom symbols, identifiers, camelCase, PascalCase, and package names
 *        from codebases, package.json, or Cargo.toml into Murmur's local SQLite vocabulary.
 * WHY:   Developers dictate project-specific function names, variables, and components that
 *        standard models get wrong. 1-click repository import makes accuracy instantaneous.
 * WHERE: Triggered from DictionaryManager in Settings.
 */

import { useState } from "react";
import { X, Code, Check, Sparkles, CheckSquare, Square } from "lucide-react";
import { commands } from "@/lib/bindings";
import { unwrapCommand } from "@/lib/ipc";

export interface RepoImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

interface ExtractedTerm {
  pattern: string;
  replacement: string;
  selected: boolean;
  category: string;
}

export function RepoImporterModal({ isOpen, onClose, onImported }: RepoImporterModalProps) {
  const [sourceText, setSourceText] = useState("");
  const [extracted, setExtracted] = useState<ExtractedTerm[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const analyzeSource = () => {
    if (!sourceText.trim()) return;

    const terms: Map<string, ExtractedTerm> = new Map();

    // 1. JSON analysis (package.json dependencies & scripts)
    try {
      const parsed = JSON.parse(sourceText);
      const allDeps = {
        ...parsed.dependencies,
        ...parsed.devDependencies,
        ...parsed.peerDependencies,
      };
      for (const dep of Object.keys(allDeps)) {
        const clean = dep.replace(/^@[\w-]+\//, "");
        const phonetic = clean.replace(/[-_]/g, " ");
        terms.set(dep, {
          pattern: phonetic,
          replacement: dep,
          selected: true,
          category: "Dependency",
        });
      }
    } catch {
      // Not pure JSON, proceed to regex parser
    }

    // 2. Identify PascalCase (Types, Components, Classes)
    const pascalRegex = /\b[A-Z][a-zA-Z0-9]{2,}\b/g;
    let match: RegExpExecArray | null;
    while ((match = pascalRegex.exec(sourceText)) !== null) {
      const symbol = match[0];
      if (["String", "Boolean", "Number", "Array", "Object", "Function", "True", "False"].includes(symbol)) continue;
      const phonetic = symbol.replace(/([A-Z])/g, " $1").trim().toLowerCase();
      if (!terms.has(symbol)) {
        terms.set(symbol, {
          pattern: phonetic,
          replacement: symbol,
          selected: true,
          category: "Component / Type",
        });
      }
    }

    // 3. Identify camelCase (Functions, Variables)
    const camelRegex = /\b[a-z][a-zA-Z0-9]{2,}\b/g;
    while ((match = camelRegex.exec(sourceText)) !== null) {
      const symbol = match[0];
      // Must contain at least one uppercase letter
      if (/[A-Z]/.test(symbol)) {
        const phonetic = symbol.replace(/([A-Z])/g, " $1").trim().toLowerCase();
        if (!terms.has(symbol)) {
          terms.set(symbol, {
            pattern: phonetic,
            replacement: symbol,
            selected: true,
            category: "Function / Variable",
          });
        }
      }
    }

    // 4. Identify snake_case / CONSTANT_CASE
    const snakeRegex = /\b[a-zA-Z0-9]+_[a-zA-Z0-9_]+\b/g;
    while ((match = snakeRegex.exec(sourceText)) !== null) {
      const symbol = match[0];
      const phonetic = symbol.replace(/_/g, " ").toLowerCase();
      if (!terms.has(symbol)) {
        terms.set(symbol, {
          pattern: phonetic,
          replacement: symbol,
          selected: true,
          category: "Identifier",
        });
      }
    }

    setExtracted(Array.from(terms.values()).slice(0, 50));
  };

  const toggleSelect = (index: number) => {
    setExtracted((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)),
    );
  };

  const toggleSelectAll = () => {
    const allSelected = extracted.every((t) => t.selected);
    setExtracted((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  const executeImport = async () => {
    const toImport = extracted.filter((t) => t.selected);
    if (toImport.length === 0) return;

    setIsImporting(true);
    setImportStatus(null);

    try {
      for (const item of toImport) {
        await unwrapCommand(() =>
          commands.createDictionaryEntry({
            pattern: item.pattern,
            replacement: item.replacement,
            match_kind: "WORD",
          }),
        );
      }
      setImportStatus(`Successfully imported ${toImport.length} project terms.`);
      onImported();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setImportStatus("Error saving entries to database.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Surface */}
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-card bg-elevated border border-[var(--border-hairline)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-input bg-sunken text-text-primary">
              <Code className="size-4" />
            </div>
            <div>
              <h2 className="text-body font-semibold text-text-primary">
                Import Repository & Codebase Vocabulary
              </h2>
              <p className="text-caption text-text-secondary">
                Auto-extract components, functions, types, and dependencies
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-input text-text-secondary transition-colors hover:bg-sunken hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {extracted.length === 0 ? (
            <div className="space-y-3">
              <p className="text-caption text-text-secondary leading-relaxed">
                Paste your project's <code className="rounded bg-sunken px-1 font-mono text-[11px]">package.json</code>, <code className="rounded bg-sunken px-1 font-mono text-[11px]">Cargo.toml</code>, or TypeScript/Python source code below. Murmur will automatically extract your identifiers and phonetic triggers.
              </p>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste code snippet, package.json dependencies, or type declarations..."
                className="w-full h-40 rounded-input bg-sunken border border-[var(--border-hairline)] p-3 text-caption font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-text-primary"
              />
              <button
                type="button"
                onClick={analyzeSource}
                disabled={!sourceText.trim()}
                className="inline-flex h-8 items-center gap-1.5 rounded-input bg-text-primary px-4 text-caption font-medium text-opaque-elevated transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Sparkles className="size-3.5" />
                <span>Extract Identifiers</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-caption font-semibold text-text-primary">
                  Found {extracted.length} Project Terms
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-text-primary"
                  >
                    {extracted.every((t) => t.selected) ? (
                      <CheckSquare className="size-3" />
                    ) : (
                      <Square className="size-3" />
                    )}
                    <span>Toggle all</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtracted([])}
                    className="text-[11px] text-text-secondary underline hover:text-text-primary"
                  >
                    Paste another
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-input border border-[var(--border-hairline)] bg-sunken divide-y divide-[var(--border-hairline)]">
                {extracted.map((item, idx) => (
                  <div
                    key={item.replacement}
                    onClick={() => toggleSelect(idx)}
                    className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-surface transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => {}}
                        className="rounded border-[var(--border-hairline)]"
                      />
                      <div className="min-w-0">
                        <span className="text-caption font-mono font-medium text-text-primary block truncate">
                          {item.replacement}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          Spoken trigger: "{item.pattern}"
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-text-secondary">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {importStatus && (
            <div className="rounded-input bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-caption text-emerald-400">
              {importStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-hairline)] bg-sunken/30 px-5 py-3">
          <span className="text-caption text-text-secondary">
            {extracted.filter((t) => t.selected).length} terms selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-input border border-[var(--border-hairline)] bg-surface px-3 text-caption font-medium text-text-primary hover:bg-sunken"
            >
              Cancel
            </button>
            {extracted.length > 0 && (
              <button
                type="button"
                onClick={executeImport}
                disabled={isImporting || extracted.filter((t) => t.selected).length === 0}
                className="inline-flex h-8 items-center gap-1.5 rounded-input bg-text-primary px-4 text-caption font-medium text-opaque-elevated hover:opacity-90 disabled:opacity-40"
              >
                <Check className="size-3.5" />
                <span>{isImporting ? "Importing..." : "Add to Vocabulary"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
