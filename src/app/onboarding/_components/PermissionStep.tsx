/**
 * SOURCE OF TRUTH KEYWORDS: PermissionStep, PermissionReport, PermissionState,
 *   requestPermission, openPrivacyPane, NOT_DETERMINED, DENIED, focus-recheck
 * WHAT:  The permission step: microphone and accessibility, each with the one
 *        action that can actually change its state.
 * WHY:   NOT_DETERMINED is the only state where a prompt is possible — macOS
 *        shows the system dialog exactly once per bundle and signature. After a
 *        denial another "Allow" button would do nothing at all, so the UI offers
 *        the privacy pane instead; that deep link is the ONLY recovery, and
 *        pretending otherwise wastes the user's one attempt. State is re-checked
 *        on window focus because the user grants it in System Settings, in
 *        another app, and returns expecting this screen to have noticed.
 *        Accessibility is explicitly optional: without it delivery degrades to
 *        clipboard-only, which is a success, not a failure.
 * WHERE: Step one of onboarding.
 */

import { useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, Mic } from "lucide-react";
import {
  commands,
  type DeviceInfo,
  type OsPermission,
  type PermissionReport,
  type SettingValue,
} from "@/lib/bindings";
import { unwrapCommand, useCommand } from "@/lib/ipc";

const PERMISSION_COPY: Readonly<
  Record<OsPermission, { label: string; why: string; required: boolean }>
> = {
  MICROPHONE: {
    label: "Microphone",
    why: "Murmur cannot hear you without it.",
    required: true,
  },
  ACCESSIBILITY: {
    label: "Accessibility",
    why: "Lets Murmur paste for you. Without it, your words still go to the clipboard.",
    required: false,
  },
};

export function PermissionStep({
  reports,
  onChanged,
}: {
  reports: readonly PermissionReport[];
  onChanged: () => void;
}) {
  const devices = useCommand(commands.listInputDevices, []);
  const settings = useCommand(commands.getSettings, []);
  const [selectedDevice, setSelectedDevice] = useState<string>("default");

  useEffect(() => {
    if (settings.data && "dictation.input_device" in settings.data) {
      const val = settings.data["dictation.input_device"];
      if (val && typeof val === "object" && "type" in val && val.type === "CHOICE") {
        setSelectedDevice(val.value);
      }
    }
  }, [settings.data]);

  const onSelectDevice = useCallback((id: string) => {
    setSelectedDevice(id);
    void unwrapCommand(() =>
      commands.setSetting({
        key: "dictation.input_device",
        value: { type: "CHOICE", value: id } as SettingValue,
      }),
    );
  }, []);

  const request = useCallback(
    (permission: OsPermission) => {
      void unwrapCommand(() => commands.requestPermission({ permission })).then(onChanged);
    },
    [onChanged],
  );

  const openSettings = useCallback((permission: OsPermission) => {
    void unwrapCommand(() => commands.openPrivacyPane({ permission }));
  }, []);

  const micGranted = reports.find((r) => r.permission === "MICROPHONE")?.state === "GRANTED";

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {reports.map((report) => {
          const copy = PERMISSION_COPY[report.permission];
          return (
            <li
              key={report.permission}
              className="hairline flex items-center gap-3 rounded-card bg-sunken p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body text-text-primary">
                  {copy.label}
                  {!copy.required ? <span className="text-text-tertiary"> · optional</span> : null}
                </p>
                <p className="text-caption text-text-secondary">
                  {report.state === "DENIED"
                    ? `${copy.why} This has to be turned on in Windows / System Settings.`
                    : copy.why}
                </p>
              </div>

              {report.state === "GRANTED" ? (
                <Check className="size-4 shrink-0 text-success" aria-label="Granted" />
              ) : report.state === "NOT_DETERMINED" ? (
                <button
                  type="button"
                  onClick={() => request(report.permission)}
                  className="hairline h-8 shrink-0 rounded-input bg-glass px-3 text-body text-text-primary transition-colors hover:bg-sunken-strong"
                >
                  Allow
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openSettings(report.permission)}
                  className="hairline flex h-8 shrink-0 items-center gap-1 rounded-input bg-glass px-3 text-body text-text-primary transition-colors hover:bg-sunken-strong"
                >
                  <ExternalLink className="size-4" />
                  Settings
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {micGranted && devices.data && devices.data.length > 0 && (
        <div className="hairline flex flex-col gap-1.5 rounded-card bg-sunken p-3">
          <label
            htmlFor="mic-select"
            className="flex items-center gap-1.5 text-caption font-medium text-text-secondary"
          >
            <Mic className="size-3.5" />
            Input Microphone
          </label>
          <select
            id="mic-select"
            value={selectedDevice}
            onChange={(e) => onSelectDevice(e.target.value)}
            className="hairline h-8 w-full rounded-input bg-glass px-2.5 text-caption text-stone-900 dark:text-stone-100 dark:bg-stone-800/80 focus:outline-none"
          >
            <option
              value="default"
              className="bg-white text-stone-900 dark:bg-[#1c1917] dark:text-stone-100"
            >
              Default Input Device
            </option>
            {devices.data.map((dev: DeviceInfo) => (
              <option
                key={dev.id}
                value={dev.id}
                className="bg-white text-stone-900 dark:bg-[#1c1917] dark:text-stone-100"
              >
                {dev.name} {dev.is_default ? "(System Default)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
