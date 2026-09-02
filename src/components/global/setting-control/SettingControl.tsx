/**
 * SOURCE OF TRUTH KEYWORDS: SettingControl, SettingControlProps, SettingDef,
 *   renderControl, settings-row, tooltip
 * WHAT:  Renders one settings row from a SettingDef — label, description, and
 *        hover tooltip next to the label, with the control right-aligned.
 * WHY:   Branches strictly on `kind`. Surfaces full setting descriptions as
 *        both body copy and hover tooltips for advanced parameters.
 * WHERE: The settings view maps the registry's SettingDefs onto this.
 */

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { HotkeyControl, NumberControl, SelectControl, TextControl, ToggleControl } from "./controls";
import type { SettingDef } from "./types";

export interface SettingControlProps {
  setting: SettingDef;
  className?: string;
}

function renderControl(setting: SettingDef) {
  switch (setting.kind) {
    case "toggle":
      return <ToggleControl setting={setting} />;
    case "select":
      return <SelectControl setting={setting} />;
    case "number":
      return <NumberControl setting={setting} />;
    case "text":
      return <TextControl setting={setting} />;
    case "hotkey":
      return <HotkeyControl setting={setting} />;
    case "custom":
      return setting.control;
  }
}

export function SettingControl({ setting, className }: SettingControlProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={cn("flex items-center gap-4 py-3", setting.disabled && "opacity-50", className)}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 relative">
          <label htmlFor={setting.id} className="text-body text-text-primary">
            {setting.label}
          </label>
          {setting.description && (
            <div
              className="relative inline-flex items-center"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <button
                type="button"
                aria-label={`Info: ${setting.label}`}
                className="text-text-tertiary hover:text-text-primary transition-colors p-0.5 rounded-full"
              >
                <Info className="size-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-1.5 z-30 w-64 p-2 rounded-input bg-elevated hairline shadow-card text-caption text-text-secondary animate-in fade-in zoom-in-95 pointer-events-none">
                  {setting.description}
                </div>
              )}
            </div>
          )}
        </div>
        {setting.description ? <p className="text-caption text-text-secondary mt-0.5">{setting.description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center justify-end">{renderControl(setting)}</div>
    </div>
  );
}
