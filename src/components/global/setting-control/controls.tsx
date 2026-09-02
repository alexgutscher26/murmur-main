/**
 * SOURCE OF TRUTH KEYWORDS: SettingControls, ToggleControl, SelectControl,
 *   NumberControl, TextControl, HotkeyControl, HotkeyCapture, formatHotkey
 * WHAT:  The individual control primitives for settings — toggle switch,
 *        select dropdown, numeric stepper, text box, and hotkey recorder with
 *        conflict detection and mouse button support.
 * WHY:   Renders standard native-styled controls honoring Murmur design tokens.
 * WHERE: Rendered by SettingControl.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Keycap } from "../keycap";
import type {
  HotkeyCapture,
  HotkeySetting,
  NumberSetting,
  SelectSetting,
  TextSetting,
  ToggleSetting,
} from "./types";

export function ToggleControl({ setting }: { setting: ToggleSetting }) {
  return (
    <button
      type="button"
      id={setting.id}
      role="switch"
      aria-checked={setting.value}
      disabled={setting.disabled}
      onClick={() => setting.onChange(!setting.value)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-default rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50",
        setting.value ? "bg-[var(--accent)]" : "bg-[var(--surface-sunken-strong)]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          setting.value ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function SelectControl({ setting }: { setting: SelectSetting }) {
  return (
    <div className="relative inline-flex items-center">
      <select
        id={setting.id}
        disabled={setting.disabled}
        value={setting.value}
        onChange={(e) => setting.onChange(e.target.value)}
        className="hairline h-8 appearance-none rounded-input bg-sunken pl-3 pr-8 text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary disabled:opacity-50 cursor-default"
      >
        {setting.options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-text-tertiary" />
    </div>
  );
}

export function NumberControl({ setting }: { setting: NumberSetting }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        id={setting.id}
        disabled={setting.disabled}
        min={setting.min}
        max={setting.max}
        step={setting.step}
        value={setting.value ?? ""}
        onChange={(e) => setting.onChange(parseFloat(e.target.value) || 0)}
        className="hairline h-8 w-20 rounded-input bg-sunken px-2 text-right font-mono text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary disabled:opacity-50"
      />
      {setting.unit && <span className="text-caption text-text-secondary">{setting.unit}</span>}
    </div>
  );
}

export function TextControl({ setting }: { setting: TextSetting }) {
  return (
    <input
      type="text"
      id={setting.id}
      disabled={setting.disabled}
      value={setting.value}
      placeholder={setting.placeholder}
      onChange={(e) => setting.onChange(e.target.value)}
      className="hairline h-8 min-w-48 rounded-input bg-sunken px-2.5 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-text-primary disabled:opacity-50"
    />
  );
}

function isModifierCode(code: string): boolean {
  return (
    code.startsWith("Alt") ||
    code.startsWith("Control") ||
    code.startsWith("Meta") ||
    code.startsWith("Shift")
  );
}

function isModifierOnlyValue(val: string): boolean {
  return val === "⌥" || val === "Alt" || val === "Ctrl" || val === "⌃" || val === "⌘" || val === "Cmd";
}

export function formatHotkey(c: HotkeyCapture): string[] {
  const parts: string[] = [];
  if (c.ctrl) parts.push("Ctrl");
  if (c.alt) parts.push("Alt");
  if (c.shift) parts.push("Shift");
  if (c.meta) parts.push("Cmd");

  let keyName = c.code;
  if (keyName.startsWith("Key")) keyName = keyName.slice(3);
  else if (keyName.startsWith("Digit")) keyName = keyName.slice(5);
  else if (keyName === "Space") keyName = "Space";
  else if (keyName === "Backquote") keyName = "`";
  else if (keyName === "MouseMiddle") keyName = "Mouse 3 (Middle)";
  else if (keyName === "MouseBack") keyName = "Mouse 4 (Back)";
  else if (keyName === "MouseForward") keyName = "Mouse 5 (Forward)";

  if (keyName && !isModifierCode(c.code)) parts.push(keyName);
  return parts.length > 0 ? parts : [c.key || "Key"];
}

function detectConflict(capture: HotkeyCapture): string | null {
  const key = capture.code;
  const isCmdOrCtrl = capture.meta || capture.ctrl;

  if (isCmdOrCtrl && (key === "KeyC" || key === "KeyV" || key === "KeyX" || key === "KeyA" || key === "KeyZ")) {
    return "Conflicts with clipboard shortcut. Try Option/Alt+Space or Option+` instead.";
  }
  if (isCmdOrCtrl && (key === "KeyQ" || key === "KeyW" || key === "KeyN")) {
    return "Conflicts with window shortcut. Try Option/Alt+Space instead.";
  }
  if (capture.alt && key === "F4") {
    return "Conflicts with Alt+F4 close window.";
  }
  return null;
}

export function HotkeyControl({ setting }: { setting: HotkeySetting }) {
  const [armed, setArmed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const sawKey = useRef(false);
  const committed = useRef(false);

  useEffect(() => {
    if (!armed) return;
    sawKey.current = false;
    committed.current = false;

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.code === "Escape") {
        setArmed(false);
        setHint(null);
        return;
      }

      if (isModifierCode(event.code)) {
        setHint("Release to use modifier alone, or press a key for a chord.");
        return;
      }

      sawKey.current = true;
      const capture: HotkeyCapture = {
        key: event.key,
        code: event.code,
        alt: event.altKey,
        ctrl: event.ctrlKey,
        meta: event.metaKey,
        shift: event.shiftKey,
      };

      const conflict = detectConflict(capture);
      if (conflict) {
        setConflictWarning(conflict);
      } else {
        setConflictWarning(null);
      }

      commit(capture);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!isModifierCode(event.code) || sawKey.current || committed.current) return;
      event.preventDefault();
      event.stopPropagation();
      commit({
        key: "",
        code: event.code,
        alt: event.altKey || event.code.startsWith("Alt"),
        ctrl: event.ctrlKey || event.code.startsWith("Control"),
        meta: event.metaKey || event.code.startsWith("Meta"),
        shift: event.shiftKey || event.code.startsWith("Shift"),
      });
    };

    const onMouseDown = (event: MouseEvent) => {
      // Capture auxiliary mouse buttons: 1 = Middle, 3 = Back, 4 = Forward
      if (event.button === 1 || event.button === 3 || event.button === 4) {
        event.preventDefault();
        event.stopPropagation();
        const mouseCode =
          event.button === 1
            ? "MouseMiddle"
            : event.button === 3
            ? "MouseBack"
            : "MouseForward";

        commit({
          key: mouseCode,
          code: mouseCode,
          alt: event.altKey,
          ctrl: event.ctrlKey,
          meta: event.metaKey,
          shift: event.shiftKey,
        });
      }
    };

    function commit(capture: HotkeyCapture) {
      committed.current = true;
      const formatted = formatHotkey(capture);
      setting.onChange(formatted.join(" + "), capture);
      setHint(null);
      setArmed(false);
    }

    const onPointerDown = (e: PointerEvent) => {
      // Allow mouse buttons 1, 3, 4 to trigger via onMouseDown
      if (e.button === 0) {
        setArmed(false);
        setHint(null);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("mousedown", onMouseDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("mousedown", onMouseDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [armed, setting]);

  const gestureHint = setting.value && isModifierOnlyValue(setting.value)
    ? `Tap ${setting.value} to start dictating, and again to stop.`
    : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        id={setting.id}
        disabled={setting.disabled}
        onPointerDown={(event) => {
          event.stopPropagation();
          setArmed(true);
          setHint("Press keys or click mouse thumb button…");
          setConflictWarning(null);
        }}
        className={cn(
          "hairline h-8 min-w-28 rounded-input px-2.5 transition-colors disabled:opacity-50",
          armed ? "bg-accent-soft ring-1 ring-[var(--accent)]" : "bg-sunken hover:bg-sunken-strong"
        )}
      >
        {armed || !setting.value ? (
          <span className="text-caption text-text-tertiary">
            {armed ? "Recording shortcut…" : setting.placeholder || "Click to record"}
          </span>
        ) : (
          <Keycap size="sm" keys={[setting.value]} />
        )}
      </button>

      {conflictWarning && (
        <span className="flex items-center gap-1 max-w-64 text-right text-[11px] text-danger">
          <AlertTriangle className="size-3 shrink-0" />
          <span>{conflictWarning}</span>
        </span>
      )}

      {hint ?? gestureHint ? (
        <span className="max-w-64 text-right text-caption text-text-tertiary">
          {hint ?? gestureHint}
        </span>
      ) : null}
    </div>
  );
}
