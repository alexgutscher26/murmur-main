/**
 * SOURCE OF TRUTH KEYWORDS: ModelManager, ModelReport, ModelState, downloadModel,
 *   deleteModel, modelDownloadProgress, modelStateChanged, DownloadProgress, optimizing, usePlan
 * WHAT:  The model list with live progress, feature-gated Pro model indicators.
 * WHY:   Whisper Large v3 Turbo and Medium are Pro-tier capabilities; Starter users
 *        can use Base and Small freely and are prompted to start a 14-day Pro trial
 *        to unlock Large Turbo.
 * WHERE: The transcription section of Settings.
 */

import { useCallback, useState } from "react";
import { Download, Trash2, Sparkles } from "lucide-react";
import {
  commands,
  events,
  type DownloadProgress,
  type ModelId,
  type ModelReport,
  type ModelState,
} from "@/lib/bindings";
import { unwrapCommand, useCommand } from "@/lib/ipc";
import { useTauriEvent } from "@/lib/use-event";
import { formatBytes, formatEta, formatRate } from "@/lib/format";
import { ErrorSurface, ProgressBar, Skeleton } from "@/components/global";
import { usePlan, canUseTurboModel } from "@/lib/plan";

const STATE_LABEL: Readonly<Record<ModelState["kind"], string>> = {
  NOT_DOWNLOADED: "Not downloaded",
  DOWNLOADING: "Downloading",
  VERIFYING: "Verifying",
  OPTIMIZING: "Optimising for the Neural Engine — 15 to 60 seconds, once",
  READY: "Ready",
  FAILED: "Failed",
};

export function ModelManager() {
  const models = useCommand(commands.listModels, []);
  const [progress, setProgress] = useState<Readonly<Record<string, DownloadProgress>>>({});
  const [liveStates, setLiveStates] = useState<Readonly<Record<string, ModelState>>>({});
  const { tier, startTrial } = usePlan();

  useTauriEvent(events.modelDownloadProgress, (payload) => {
    setProgress((current) => ({ ...current, [payload.progress.model_id]: payload.progress }));
  });

  useTauriEvent(events.modelStateChanged, (payload) => {
    setLiveStates((current) => ({ ...current, [payload.model_id]: payload.state }));
  });

  const clearOverride = useCallback((modelId: ModelId) => {
    setLiveStates((current) => {
      const next = { ...current };
      delete next[modelId];
      return next;
    });
  }, []);

  const download = useCallback(
    (modelId: ModelId) => {
      const isProModel = modelId.includes("turbo") || modelId.includes("large") || modelId.includes("medium");
      if (isProModel && !canUseTurboModel(tier)) {
        startTrial();
      }
      clearOverride(modelId);
      void unwrapCommand(() => commands.downloadModel({ model_id: modelId })).then(models.reload);
    },
    [clearOverride, models.reload, tier, startTrial],
  );

  const remove = useCallback(
    (modelId: ModelId) => {
      clearOverride(modelId);
      void unwrapCommand(() => commands.deleteModel({ model_id: modelId })).then(models.reload);
    },
    [clearOverride, models.reload],
  );

  if (models.loading) {
    return <Skeleton className="h-48 rounded-card" />;
  }

  if (models.error) {
    return <ErrorSurface error={models.error} onRetry={models.reload} size="compact" />;
  }

  return (
    <ul className="hairline rounded-card bg-surface px-4">
      {(models.data ?? []).map((report) => {
        const model: ModelReport = { ...report, state: liveStates[report.descriptor.id] ?? report.state };
        const isProModel =
          model.descriptor.id.includes("turbo") ||
          model.descriptor.id.includes("large") ||
          model.descriptor.id.includes("medium");
        const isCompressed = model.descriptor.id.includes("q3_");
        const isLocked = isProModel && !canUseTurboModel(tier);

        return (
          <li key={model.descriptor.id} className="hairline-b flex items-center gap-4 py-3 last:border-b-0">
            <ModelSummary
              model={model}
              progress={progress[model.descriptor.id]}
              isProModel={isProModel}
              isCompressed={isCompressed}
              isLocked={isLocked}
            />
            <ModelAction
              model={model}
              isLocked={isLocked}
              onDownload={download}
              onDelete={remove}
              onUnlock={startTrial}
            />
          </li>
        );
      })}
    </ul>
  );
}

function ModelSummary({
  model,
  progress,
  isProModel,
  isCompressed,
  isLocked,
}: {
  model: ModelReport;
  progress: DownloadProgress | undefined;
  isProModel: boolean;
  isCompressed?: boolean;
  isLocked: boolean;
}) {
  const { descriptor, state } = model;
  const downloading = state.kind === "DOWNLOADING";
  const received = progress?.received_bytes ?? (downloading ? state.received_bytes : 0);
  const total = progress?.total_bytes ?? (downloading ? state.total_bytes : descriptor.size_bytes);
  const eta = progress ? formatEta(Math.max(0, total - received), progress.bytes_per_second) : null;

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-stone-900 dark:text-white">{descriptor.display_name}</p>
        {isCompressed && (
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Compressed
          </span>
        )}
        {isProModel && (
          <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
            <Sparkles className="size-2.5" />
            PRO
          </span>
        )}
        {isLocked && (
          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
            (14-day trial available)
          </span>
        )}
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{descriptor.description}</p>

      {downloading ? (
        <ProgressBar
          className="mt-2"
          label={`Downloading ${descriptor.display_name}`}
          fraction={total > 0 ? received / total : 0}
          caption={
            <>
              {formatBytes(received)} of {formatBytes(total)}
              {progress ? ` · ${formatRate(progress.bytes_per_second)}` : ""}
              {eta ? ` · ${eta} left` : ""}
            </>
          }
        />
      ) : (
        <p className="text-xs tabular-nums text-stone-400 dark:text-stone-500 mt-1">
          {formatBytes(descriptor.size_bytes)} · {descriptor.approx_ram_mb} MB memory ·{" "}
          {state.kind === "FAILED" ? state.message : STATE_LABEL[state.kind]}
        </p>
      )}
    </div>
  );
}

function ModelAction({
  model,
  isLocked,
  onDownload,
  onDelete,
  onUnlock,
}: {
  model: ModelReport;
  isLocked: boolean;
  onDownload: (modelId: ModelId) => void;
  onDelete: (modelId: ModelId) => void;
  onUnlock: () => void;
}) {
  const { state, descriptor } = model;
  const busy = state.kind === "DOWNLOADING" || state.kind === "VERIFYING" || state.kind === "OPTIMIZING";

  if (busy) return <span className="shrink-0 text-caption text-text-tertiary">{STATE_LABEL[state.kind]}</span>;

  if (state.kind === "READY") {
    return (
      <button
        type="button"
        aria-label={`Delete ${descriptor.display_name}`}
        onClick={() => onDelete(descriptor.id)}
        className="shrink-0 rounded-input p-1 text-text-secondary transition-colors hover:bg-sunken hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    );
  }

  if (isLocked) {
    return (
      <button
        type="button"
        onClick={onUnlock}
        className="hairline flex shrink-0 items-center gap-1.5 rounded-input bg-sunken px-2.5 py-1 text-xs font-semibold text-text-primary transition-colors hover:bg-sunken-strong"
      >
        <Sparkles className="size-3" />
        Unlock Trial
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onDownload(descriptor.id)}
      className="hairline flex shrink-0 items-center gap-2 rounded-input bg-sunken px-3 py-1 text-body text-text-primary transition-colors hover:bg-sunken-strong"
    >
      <Download className="size-4" />
      {state.kind === "FAILED" ? "Try again" : "Download"}
    </button>
  );
}
