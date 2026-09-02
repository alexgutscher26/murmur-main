/**
 * SOURCE OF TRUTH KEYWORDS: window-state, useWindowBoundsPersistence, rememberWindowPosition
 * WHAT:  Saves and restores dashboard window size and position in localStorage.
 * WHY:   Ensures the window reopens at the user's preferred location and dimensions.
 * WHERE: Invoked by Dashboard.tsx.
 */

import { useEffect } from "react";
import { getCurrentWindow, LogicalSize, LogicalPosition } from "@tauri-apps/api/window";

const BOUNDS_STORAGE_KEY = "murmur_dashboard_window_bounds";

interface WindowBounds {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export function useWindowBoundsPersistence() {
  useEffect(() => {
    let unlistenResize: (() => void) | null = null;
    let unlistenMove: (() => void) | null = null;

    const setup = async () => {
      try {
        const appWindow = getCurrentWindow();

        // Restore saved bounds on startup
        const savedJson = localStorage.getItem(BOUNDS_STORAGE_KEY);
        if (savedJson) {
          const bounds = JSON.parse(savedJson) as WindowBounds;
          if (bounds.width && bounds.height && bounds.width >= 600 && bounds.height >= 400) {
            await appWindow.setSize(new LogicalSize(bounds.width, bounds.height));
          }
          if (bounds.x !== undefined && bounds.y !== undefined && bounds.x >= 0 && bounds.y >= 0) {
            await appWindow.setPosition(new LogicalPosition(bounds.x, bounds.y));
          }
        }

        // Debounce bounds saver
        let saveTimeout: ReturnType<typeof setTimeout> | null = null;
        const persistCurrentBounds = async () => {
          if (saveTimeout) clearTimeout(saveTimeout);
          saveTimeout = setTimeout(async () => {
            try {
              const size = await appWindow.innerSize();
              const pos = await appWindow.innerPosition();
              const bounds: WindowBounds = {
                width: size.width,
                height: size.height,
                x: pos.x,
                y: pos.y,
              };
              localStorage.setItem(BOUNDS_STORAGE_KEY, JSON.stringify(bounds));
            } catch {
              // Ignore window state tracking error
            }
          }, 300);
        };

        unlistenResize = await appWindow.onResized(persistCurrentBounds);
        unlistenMove = await appWindow.onMoved(persistCurrentBounds);
      } catch {
        // Fallback for non-Tauri or browser test environments
      }
    };

    void setup();

    return () => {
      if (unlistenResize) unlistenResize();
      if (unlistenMove) unlistenMove();
    };
  }, []);
}
