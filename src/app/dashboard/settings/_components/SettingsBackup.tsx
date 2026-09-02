/**
 * SOURCE OF TRUTH KEYWORDS: SettingsBackup, exportSettings, importSettings, backup-restore
 * WHAT:  Settings import & export component for backup and machine migration.
 * WHY:   Allows users to export all active settings, app profiles, and custom dictionary
 *        entries into a structured JSON file, and restore them cleanly.
 * WHERE: Rendered in SettingsView under the General/Backup section.
 */

import { useState, useRef } from "react";
import { Download, Upload, Check, AlertCircle } from "lucide-react";
import { commands, type AppProfile, type DictionaryEntry, type SettingValue } from "@/lib/bindings";
import { useCommand, unwrapCommand } from "@/lib/ipc";

interface BackupData {
  version: string;
  exportedAt: string;
  settings: { [key: string]: SettingValue };
  profiles: AppProfile[];
  dictionary: DictionaryEntry[];
}

export function SettingsBackup() {
  const settingsQuery = useCommand(commands.getSettings, []);
  const profilesQuery = useCommand(commands.listAppProfiles, []);
  const dictionaryQuery = useCommand(commands.listDictionary, []);

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const backup: BackupData = {
        version: "0.1.0",
        exportedAt: new Date().toISOString(),
        settings: settingsQuery.data ?? {},
        profiles: profilesQuery.data ?? [],
        dictionary: dictionaryQuery.data ?? [],
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `murmur-settings-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({ text: "Settings exported successfully.", type: "success" });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setStatusMessage({ text: "Failed to export settings.", type: "error" });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMessage(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text) as Partial<BackupData>;

      if (!backup.settings && !backup.profiles && !backup.dictionary) {
        throw new Error("Invalid Murmur backup file format.");
      }

      // Restore settings
      if (backup.settings) {
        for (const [key, value] of Object.entries(backup.settings)) {
          await unwrapCommand(() => commands.setSetting({ key, value }));
        }
      }

      // Restore profiles
      if (backup.profiles && Array.isArray(backup.profiles)) {
        for (const profile of backup.profiles) {
          await unwrapCommand(() => commands.saveAppProfile({ profile }));
        }
      }

      // Restore dictionary entries
      if (backup.dictionary && Array.isArray(backup.dictionary)) {
        for (const entry of backup.dictionary) {
          await unwrapCommand(() =>
            commands.createDictionaryEntry({
              pattern: entry.pattern,
              replacement: entry.replacement,
              match_kind: entry.match_kind,
            })
          );
        }
      }

      // Reload queries
      await Promise.all([
        settingsQuery.reload(),
        profilesQuery.reload(),
        dictionaryQuery.reload(),
      ]);

      setStatusMessage({
        text: "Settings, profiles, and dictionary restored successfully.",
        type: "success",
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error restoring backup.";
      setStatusMessage({ text: msg, type: "error" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="hairline rounded-card bg-surface p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-body font-semibold text-text-primary">
            Settings Backup & Migration
          </h4>
          <p className="text-caption text-text-secondary">
            Export all global preferences, per-app profiles, and custom dictionary to a JSON file.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={handleExport}
            className="hairline flex items-center gap-1.5 h-[var(--control-height)] rounded-input bg-sunken px-3 text-caption font-medium text-text-primary transition-colors hover:bg-sunken-strong"
          >
            <Download className="size-3.5 text-text-secondary" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
            className="hairline flex items-center gap-1.5 h-[var(--control-height)] rounded-input bg-sunken px-3 text-caption font-medium text-text-primary transition-colors hover:bg-sunken-strong disabled:opacity-50"
          >
            <Upload className="size-3.5 text-text-secondary" />
            <span>{isImporting ? "Importing..." : "Import JSON"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`hairline flex items-center gap-2 rounded-input px-3 py-1.5 text-caption font-mono ${
            statusMessage.type === "success"
              ? "bg-sunken text-text-primary"
              : "bg-[var(--danger-soft)] text-danger"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="size-3.5 shrink-0" />
          ) : (
            <AlertCircle className="size-3.5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
