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
import { Download, Trash2, Sparkles, Check, ShieldAlert, Loader2 } from "lucide-react";
import {
  commands,
  events,
  type AppError,
  type DownloadProgress,
  type ModelId,
  type ModelReport,
  type ModelState,
} from "@/lib/bindings";
import { unwrapCommand, useCommand } from "@/lib/ipc";
import { useTauriEvent } from "@/lib/use-event";
import { formatBytes, formatEta, formatRate } from "@/lib/format";
import { ErrorSurface, ProgressBar, Skeleton, ProFeatureModal } from "@/components/global";
import { usePlan, canUseTurboModel } from "@/lib/plan";
import { useSettings } from "../../use-settings";

const STATE_LABEL: Readonly<Record<ModelState["kind"], string>> = {
  NOT_DOWNLOADED: "Not downloaded",
  DOWNLOADING: "Downloading",
  VERIFYING: "Verifying",
  OPTIMIZING: "Optimizing for DirectML/Metal",
  READY: "Ready",
  FAILED: "Failed",
};

export function ModelManager() {
  const models = useCommand(commands.listModels, []);
  const settings = useSettings();
  const activeModelId = (settings.data?.["transcription.model"]?.value as string) || "small-q5_1";
  const isAirGapActive =
    settings.data?.["privacy.air_gap_mode"]?.type === "BOOL" &&
    Boolean(settings.data["privacy.air_gap_mode"].value);

  const [progress, setProgress] = useState<Readonly<Record<string, DownloadProgress>>>({});
  const [liveStates, setLiveStates] = useState<Readonly<Record<string, ModelState>>>({});
  const [downloadingIds, setDownloadingIds] = useState<ReadonlySet<string>>(new Set());
  const [proModalOpen, setProModalOpen] = useState(false);
  const [gatedModelName, setGatedModelName] = useState("Whisper Large v3 Turbo");
  const [downloadError, setDownloadError] = useState<AppError | null>(null);
  const { tier } = usePlan();

  const activateModel = useCallback((modelId: ModelId) => {
    void unwrapCommand(() =>
      commands.setSetting({
        key: "transcription.model",
        value: { type: "CHOICE", value: modelId },
      }),
    );
  }, []);

  useTauriEvent(events.modelDownloadProgress, (payload) => {
    setProgress((current) => ({ ...current, [payload.progress.model_id]: payload.progress }));
    setDownloadingIds((current) => {
      if (current.has(payload.progress.model_id)) return current;
      return new Set([...current, payload.progress.model_id]);
    });
  });

  useTauriEvent(events.modelStateChanged, (payload) => {
    setLiveStates((current) => ({ ...current, [payload.model_id]: payload.state }));
    if (payload.state.kind !== "DOWNLOADING") {
      setDownloadingIds((current) => {
        if (!current.has(payload.model_id)) return current;
        const next = new Set(current);
        next.delete(payload.model_id);
        return next;
      });
      models.reload();
    }
  });

  const clearOverride = useCallback((modelId: ModelId) => {
    setLiveStates((current) => {
      const next = { ...current };
      delete next[modelId];
      return next;
    });
    setProgress((prev) => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
  }, []);

  const download = useCallback(
    async (modelId: ModelId, displayName?: string) => {
      setDownloadError(null);
      const isProModel = modelId.includes("turbo") || modelId.includes("large") || modelId.includes("medium");
      if (isProModel && !canUseTurboModel(tier)) {
        setGatedModelName(displayName || "Whisper Large v3 Turbo");
        setProModalOpen(true);
        return;
      }
      if (downloadingIds.has(modelId)) {
        return;
      }
      if (isAirGapActive) {
        await unwrapCommand(() =>
          commands.setSetting({
            key: "privacy.air_gap_mode",
            value: { type: "BOOL", value: false },
          }),
        );
        settings.reload();
      }
      const existingState =
        liveStates[modelId] ?? models.data?.find((m) => m.descriptor.id === modelId)?.state;
      const existingReceived = existingState?.kind === "DOWNLOADING" ? existingState.received_bytes : 0;
      const existingTotal =
        existingState?.kind === "DOWNLOADING"
          ? existingState.total_bytes
          : (models.data?.find((m) => m.descriptor.id === modelId)?.descriptor.size_bytes ?? 0);

      clearOverride(modelId);
      setDownloadingIds((prev) => new Set([...prev, modelId]));
      setLiveStates((current) => ({
        ...current,
        [modelId]: { kind: "DOWNLOADING", received_bytes: existingReceived, total_bytes: existingTotal },
      }));

      let inProgress = false;
      try {
        const res = await unwrapCommand(() => commands.downloadModel({ model_id: modelId }));
        if (res.status === "error") {
          if (res.error.message === "That is already in progress.") {
            inProgress = true;
          } else {
            setDownloadError(res.error);
          }
        }
      } finally {
        if (!inProgress) {
          setDownloadingIds((prev) => {
            const next = new Set(prev);
            next.delete(modelId);
            return next;
          });
          models.reload();
        }
      }
    },
    [clearOverride, downloadingIds, isAirGapActive, liveStates, models, settings, tier],
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
    <>
      {isAirGapActive && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-card border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Air-Gap Mode is Active:</strong> Network sockets are isolated. Downloading a model will automatically disable Air-Gap Mode.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              void unwrapCommand(() =>
                commands.setSetting({
                  key: "privacy.air_gap_mode",
                  value: { type: "BOOL", value: false },
                }),
              ).then(settings.reload);
            }}
            className="shrink-0 rounded-lg bg-amber-500/20 px-2.5 py-1 font-medium hover:bg-amber-500/30 transition-colors cursor-pointer"
          >
            Disable Air-Gap
          </button>
        </div>
      )}

      {downloadError ? (
        <div className="mb-3">
          <ErrorSurface error={downloadError} size="compact" />
        </div>
      ) : null}

      <ul className="hairline rounded-card bg-surface px-4">
        {(models.data ?? []).map((report) => {
          const model: ModelReport = { ...report, state: liveStates[report.descriptor.id] ?? report.state };
          const isProModel =
            model.descriptor.id.includes("turbo") ||
            model.descriptor.id.includes("large") ||
            model.descriptor.id.includes("medium");
          const isCompressed = model.descriptor.id.includes("q3_");
          const isUnlocked = canUseTurboModel(tier);
          const isLocked = isProModel && !isUnlocked;
          const isActive = model.descriptor.id === activeModelId;
          const isDownloading = downloadingIds.has(model.descriptor.id);
          const isAnyDownloading = downloadingIds.size > 0;

          return (
            <li key={model.descriptor.id} className="hairline-b flex items-center gap-4 py-3 last:border-b-0">
              <ModelSummary
                model={model}
                progress={progress[model.descriptor.id]}
                isProModel={isProModel}
                isCompressed={isCompressed}
                isLocked={isLocked}
                isUnlocked={isUnlocked}
                isActive={isActive}
                isDownloading={isDownloading}
              />
              <ModelAction
                model={model}
                isLocked={isLocked}
                isActive={isActive}
                isDownloading={isDownloading}
                isAnyDownloading={isAnyDownloading}
                onDownload={(id) => download(id, model.descriptor.display_name)}
                onDelete={remove}
                onActivate={() => activateModel(model.descriptor.id)}
                onUnlock={() => {
                  setGatedModelName(model.descriptor.display_name);
                  setProModalOpen(true);
                }}
              />
            </li>
          );
        })}
      </ul>

      <ProFeatureModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName={gatedModelName}
        description="Whisper Large v3 Turbo delivers high-precision accuracy with deep domain jargon understanding, punctuation inference, and zero cloud latency."
      />
    </>
  );
}

function ModelSummary({
  model,
  progress,
  isProModel,
  isCompressed,
  isLocked,
  isUnlocked,
  isActive,
  isDownloading,
}: {
  model: ModelReport;
  progress: DownloadProgress | undefined;
  isProModel: boolean;
  isCompressed?: boolean;
  isLocked: boolean;
  isUnlocked: boolean;
  isActive: boolean;
  isDownloading?: boolean;
}) {
  const { descriptor, state } = model;
  const isStateDownloading = state.kind === "DOWNLOADING";
  const isActivelyDownloading = Boolean(isDownloading);
  const downloading = isActivelyDownloading || isStateDownloading;
  const received = progress?.received_bytes ?? (isStateDownloading ? state.received_bytes : 0);
  const total = progress?.total_bytes ?? (isStateDownloading ? state.total_bytes : descriptor.size_bytes);
  const eta = progress ? formatEta(Math.max(0, total - received), progress.bytes_per_second) : null;

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-medium text-stone-900 dark:text-white">{descriptor.display_name}</p>
        {isActive && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <Check className="size-3" />
            Active
          </span>
        )}
        {isCompressed && (
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Compressed
          </span>
        )}
        {isProModel && (
          isUnlocked ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <Sparkles className="size-2.5" />
              PRO UNLOCKED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
              <Sparkles className="size-2.5" />
              PRO
            </span>
          )
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
          label={isActivelyDownloading ? `Downloading ${descriptor.display_name}` : `Partial download: ${descriptor.display_name}`}
          fraction={total > 0 ? received / total : 0}
          caption={
            <>
              {formatBytes(received)} of {formatBytes(total)}
              {progress ? ` · ${formatRate(progress.bytes_per_second)}` : (!isActivelyDownloading ? " · Paused" : "")}
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
  isActive,
  isDownloading,
  isAnyDownloading,
  onDownload,
  onDelete,
  onActivate,
  onUnlock,
}: {
  model: ModelReport;
  isLocked: boolean;
  isActive: boolean;
  isDownloading?: boolean;
  isAnyDownloading?: boolean;
  onDownload: (modelId: ModelId) => void;
  onDelete: (modelId: ModelId) => void;
  onActivate: () => void;
  onUnlock: () => void;
}) {
  const { state, descriptor } = model;

  if (isDownloading) {
    return (
      <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-stone-500 dark:text-stone-400">
        <Loader2 className="size-3.5 animate-spin" />
        <span>Downloading...</span>
      </div>
    );
  }

  if (state.kind === "DOWNLOADING") {
    // Partial download exists on disk, but no active download in flight
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          disabled={isAnyDownloading}
          onClick={() => onDownload(descriptor.id)}
          className="hairline flex shrink-0 items-center gap-1.5 rounded-input bg-sunken px-2.5 py-1 text-xs font-semibold text-text-primary transition-colors hover:bg-sunken-strong disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title={isAnyDownloading ? "Another download is in progress" : undefined}
        >
          <Download className="size-3.5" />
          Resume
        </button>
        <button
          type="button"
          disabled={isAnyDownloading}
          aria-label={`Delete partial download for ${descriptor.display_name}`}
          onClick={() => onDelete(descriptor.id)}
          className="shrink-0 rounded-input p-1 text-text-secondary transition-colors hover:bg-sunken hover:text-danger disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title={isAnyDownloading ? "Another download is in progress" : "Delete partial download"}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    );
  }

  if (state.kind === "VERIFYING") {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
          <Loader2 className="size-3.5 animate-spin" />
          <span>Verifying...</span>
        </div>
        <button
          type="button"
          aria-label={`Delete ${descriptor.display_name}`}
          onClick={() => onDelete(descriptor.id)}
          className="shrink-0 rounded-input p-1 text-text-secondary transition-colors hover:bg-sunken hover:text-danger cursor-pointer"
          title="Delete file"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    );
  }

  if (state.kind === "OPTIMIZING") {
    return (
      <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-stone-500 dark:text-stone-400">
        <Loader2 className="size-3.5 animate-spin" />
        <span>Optimizing...</span>
      </div>
    );
  }

  if (state.kind === "READY") {
    if (isActive) {
      return (
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <Check className="size-3.5" />
            Active Model
          </span>
          <button
            type="button"
            aria-label={`Delete ${descriptor.display_name}`}
            onClick={() => onDelete(descriptor.id)}
            className="shrink-0 rounded-input p-1 text-text-secondary transition-colors hover:bg-sunken hover:text-danger cursor-pointer"
            title="Delete local file"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onActivate}
          className="hairline flex shrink-0 items-center gap-1.5 rounded-input bg-text-primary px-3 py-1 text-xs font-semibold text-opaque-elevated transition-all hover:opacity-90 cursor-pointer shadow-xs"
        >
          <Check className="size-3.5" />
          Use Model
        </button>
        <button
          type="button"
          aria-label={`Delete ${descriptor.display_name}`}
          onClick={() => onDelete(descriptor.id)}
          className="shrink-0 rounded-input p-1 text-text-secondary transition-colors hover:bg-sunken hover:text-danger cursor-pointer"
          title="Delete local file"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    );
  }

  if (isLocked) {
    return (
      <button
        type="button"
        onClick={onUnlock}
        className="hairline flex shrink-0 items-center gap-1.5 rounded-input bg-sunken px-2.5 py-1 text-xs font-semibold text-text-primary transition-colors hover:bg-sunken-strong cursor-pointer"
      >
        <Sparkles className="size-3" />
        Unlock Trial
      </button>
    );
  }

  if (state.kind === "FAILED") {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          disabled={isAnyDownloading}
          onClick={() => onDownload(descriptor.id)}
          className="hairline flex shrink-0 items-center gap-2 rounded-input bg-sunken px-3 py-1 text-body text-text-primary transition-colors hover:bg-sunken-strong disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title={isAnyDownloading ? "Another download is in progress" : undefined}
        >
          <Download className="size-4" />
          Try again
        </button>
        <button
          type="button"
          aria-label={`Delete ${descriptor.display_name}`}
          onClick={() => onDelete(descriptor.id)}
          className="shrink-0 rounded-input p-1 text-text-secondary transition-colors hover:bg-sunken hover:text-danger cursor-pointer"
          title="Delete file"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isAnyDownloading}
      onClick={() => onDownload(descriptor.id)}
      className="hairline flex shrink-0 items-center gap-2 rounded-input bg-sunken px-3 py-1 text-body text-text-primary transition-colors hover:bg-sunken-strong disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      title={isAnyDownloading ? "Another download is in progress" : undefined}
    >
      <Download className="size-4" />
      Download
    </button>
  );
}
