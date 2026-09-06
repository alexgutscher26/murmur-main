/**
 * SOURCE OF TRUTH KEYWORDS: Onboarding, OnboardingStep, usePermissions,
 *   checkPermissions, listModels, modelStateChanged, defaultModel, StepShell
 * WHAT:  The first-run flow: a three-slide tour of what the app does, then
 *        permissions, then the model, then a real hotkey test, and finally an
 *        invitation that asks for nothing.
 * WHY:   The tour comes first because the operator asked for the app to teach
 *        before it asks: a permission dialog is a strange first thing to meet,
 *        and someone who has been shown what the app does has a reason to grant
 *        it. Past the tour, the step is DERIVED from what the backend reports,
 *        never advanced by a counter — permission granted, model ready, session delivered. So a user
 *        who already granted microphone access skips that screen, and one who
 *        quits mid-download returns to exactly where they were rather than to
 *        step one. Only the microphone blocks progress: accessibility merely
 *        degrades paste to clipboard-only, so gating on it would be inventing a
 *        requirement the app does not have. The model's live state is applied
 *        here rather than inside the model step, because it is what decides
 *        whether the flow ADVANCES: a model on disk but unverified reports
 *        Verifying and only flips to Ready when the background hash check
 *        finishes, so a step listening on its own would update its own display
 *        and leave the user stuck on it forever. Finishing writes
 *        general.onboarding_complete and only then closes the window: the Rust
 *        side gates this window on that setting at launch, so closing without
 *        it would reopen onboarding on the next start with everything already
 *        done. A failed write therefore keeps the window open and says why,
 *        rather than closing on a promise it did not keep.
 * WHERE: Mounted by src/entries/onboarding.tsx. Steps live in ./_components.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  commands,
  events,
  type AppError,
  type HotkeyBinding,
  type ModelReport,
  type ModelState,
} from "@/lib/bindings";
import { unwrapCommand, useCommand } from "@/lib/ipc";
import { useTauriEvent } from "@/lib/use-event";
import { ErrorSurface } from "@/components/global";
import { StepShell } from "./_components/StepShell";
import { usePermissions } from "@/lib/use-permissions";
import { dictationModeFrom } from "@/lib/dictation-mode";
import { PermissionStep } from "./_components/PermissionStep";
import { ModelStep } from "./_components/ModelStep";
import { HotkeyStep } from "./_components/HotkeyStep";
import { TourStep } from "./_components/TourStep";
import { InviteStep } from "./_components/InviteStep";
import { TutorialStep } from "./_components/TutorialStep";

/** Declared by the Onboarding capability in the registry. Named here because
 *  "which setting means first run is over" is a contract between the two
 *  windows, and it is the only settings key the frontend has to know. */
const ONBOARDING_COMPLETE_KEY = "general.onboarding_complete";
const ONBOARDING_STEP_INDEX_KEY = "general.onboarding_step_index";
const TUTORIAL_COMPLETE_KEY = "general.tutorial_complete";

function pickModel(models: readonly ModelReport[]): ModelReport | null {
  return models.find((model) => model.descriptor.is_default) ?? models[0] ?? null;
}

function dictationHotkey(hotkeys: readonly (HotkeyBinding | null)[]): HotkeyBinding | null {
  return hotkeys.find((binding): binding is HotkeyBinding => binding !== null) ?? null;
}

export function Onboarding() {
  const permissions = usePermissions();
  const models = useCommand(commands.listModels, []);
  const registry = useCommand(commands.getRegistry, []);
  // Read rather than assumed: every screen here that teaches the gesture has to
  // match dictation.mode, or it teaches the wrong one. No live subscription —
  // nothing changes settings during first run.
  const settings = useCommand(commands.getSettings, []);

  const savedStepIndex =
    typeof settings.data?.[ONBOARDING_STEP_INDEX_KEY]?.value === "number"
      ? (settings.data[ONBOARDING_STEP_INDEX_KEY].value as number)
      : 0;
  const savedTutorialComplete = settings.data?.[TUTORIAL_COMPLETE_KEY]?.value === true;

  // Adaptive re-entry: state initialized or restored from saved registry settings
  const [toured, setToured] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [tested, setTested] = useState(false);
  const [invited, setInvited] = useState(false);
  const [finishError, setFinishError] = useState<AppError | null>(null);
  const [liveStates, setLiveStates] = useState<Readonly<Record<string, ModelState>>>({});

  useEffect(() => {
    if (savedStepIndex >= 1) {
      setToured(true);
    }
    if (savedTutorialComplete || savedStepIndex >= 4) {
      setTutorialDone(true);
    }
    if (savedStepIndex >= 5) {
      setTested(true);
      setInvited(true);
    }
  }, [savedStepIndex, savedTutorialComplete]);

  const persistStep = useCallback((stepIdx: number) => {
    void unwrapCommand(() =>
      commands.setSetting({
        key: ONBOARDING_STEP_INDEX_KEY,
        value: { type: "NUMBER", value: stepIdx },
      }),
    );
  }, []);

  useTauriEvent(events.modelStateChanged, (payload) => {
    setLiveStates((current) => ({ ...current, [payload.model_id]: payload.state }));
  });

  const micGranted =
    permissions.data?.find((report) => report.permission === "MICROPHONE")?.state === "GRANTED";
  const model = useMemo(() => {
    const picked = pickModel(models.data ?? []);
    if (!picked) return null;
    return { ...picked, state: liveStates[picked.descriptor.id] ?? picked.state };
  }, [liveStates, models.data]);
  const modelReady = model?.state.kind === "READY";

  const mode = dictationModeFrom(settings.data);

  const hotkey = dictationHotkey(
    (registry.data?.capabilities ?? []).map((capability) => capability.hotkey?.default ?? null),
  );

  const handleTutorialDone = useCallback(() => {
    setTutorialDone(true);
    void unwrapCommand(() =>
      commands.setSetting({ key: TUTORIAL_COMPLETE_KEY, value: { type: "BOOL", value: true } }),
    );
    persistStep(4);
  }, [persistStep]);

  const finish = useCallback(() => {
    void unwrapCommand(() =>
      commands.setSetting({ key: ONBOARDING_COMPLETE_KEY, value: { type: "BOOL", value: true } }),
    ).then((result) => {
      if (result.status === "error") {
        setFinishError(result.error);
        return;
      }
      persistStep(5);
      void getCurrentWindow().close();
    });
  }, [persistStep]);

  const error = permissions.error ?? models.error ?? registry.error;

  return (
    <div className="h-full">
      <div data-tauri-drag-region className="h-[var(--titlebar-height)]" />
      {error ? (
        <ErrorSurface
          error={error}
          onRetry={() => {
            permissions.reload();
            models.reload();
            registry.reload();
          }}
        />
      ) : invited ? (
        <InviteStep onFinish={finish} finishError={finishError} hotkey={hotkey} mode={mode} />
      ) : !toured ? (
        <TourStep
          hotkey={hotkey}
          mode={mode}
          onDone={() => {
            setToured(true);
            persistStep(1);
          }}
        />
      ) : !micGranted ? (
        <StepShell
          title="Two permissions"
          description="Murmur runs entirely on your Mac. It needs the microphone to hear you, and accessibility to paste for you."
        >
          <PermissionStep
            reports={permissions.data ?? []}
            onChanged={() => {
              permissions.reload();
              persistStep(2);
            }}
          />
        </StepShell>
      ) : !modelReady && model ? (
        <StepShell
          title="One model to download"
          description="This runs on your machine, so the model lives on your disk. It is downloaded once."
        >
          <ModelStep
            model={model}
            onChanged={() => {
              models.reload();
              persistStep(3);
            }}
          />
        </StepShell>
      ) : !tutorialDone ? (
        <StepShell
          title="Guided Practice"
          description="Practice dictating a messy thought and watch Murmur turn it into clean formatted text."
        >
          <TutorialStep
            hotkey={hotkey}
            mode={mode}
            onComplete={handleTutorialDone}
            onSkip={handleTutorialDone}
          />
        </StepShell>
      ) : (
        <StepShell
          title="Try it"
          description={
            mode === "push_to_talk"
              ? "Hold the hotkey anywhere, say something, and let go."
              : "Press the hotkey anywhere, say something, and press it again."
          }
          action={
            tested ? (
              <button
                type="button"
                onClick={() => {
                  setInvited(true);
                  persistStep(5);
                }}
                className="h-[var(--control-height)] rounded-input bg-text-primary px-4 text-body font-medium text-opaque-elevated transition-opacity hover:opacity-90"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInvited(true);
                  persistStep(5);
                }}
                className="h-[var(--control-height)] rounded-input px-3 text-caption text-text-secondary transition-colors hover:text-text-primary cursor-pointer"
              >
                Skip for now
              </button>
            )
          }
        >
          <HotkeyStep
            hotkey={hotkey}
            mode={mode}
            onDelivered={() => {
              setTested(true);
              persistStep(4);
            }}
          />
        </StepShell>
      )}
    </div>
  );
}
