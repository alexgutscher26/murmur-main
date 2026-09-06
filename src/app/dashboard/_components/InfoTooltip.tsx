/**
 * SOURCE OF TRUTH KEYWORDS: InfoTooltip, interactive_tooltip, card_tooltip
 * WHAT:  An interactive, accessible tooltip triggered by hover or click.
 * WHY:   Native browser `title` attributes fail to render reliably in desktop
 *        WebViews (Tauri/WebKit/WebView2) and provide no click interaction.
 *        This component guarantees instant hover display, click-to-pin, outside-click
 *        dismissal, and theme-adaptive floating popovers.
 * WHERE: Used across dashboard views (e.g. InsightsView, StatsView).
 */

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InfoTooltipProps {
  content: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  className?: string;
  iconClassName?: string;
  label?: string;
}

export function InfoTooltip({
  content,
  align = "center",
  side = "top",
  className,
  iconClassName,
  label = "More information",
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  const sideClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
  }[side];

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="rounded p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer focus:outline-hidden"
      >
        <Info className={cn("h-3.5 w-3.5", iconClassName)} />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 w-60 rounded-xl border border-stone-800/80 bg-stone-900/95 p-2.5 text-xs leading-relaxed text-stone-100 shadow-xl backdrop-blur-md dark:border-stone-700/80 dark:bg-stone-800/95 dark:text-stone-100",
            "animate-in fade-in zoom-in-95 duration-150 pointer-events-none select-none",
            alignClasses,
            sideClasses,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
