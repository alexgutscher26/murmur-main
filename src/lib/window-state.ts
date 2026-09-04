/**
 * SOURCE OF TRUTH KEYWORDS: window-state, useWindowBoundsPersistence, APP_NORMAL_WIDTH, APP_NORMAL_HEIGHT
 * WHAT:  Enforces a clean, standard fixed window size (1000x660) for the dashboard app.
 * WHY:   Prevents window ballooning on refresh or display-scaling distortion.
 * WHERE: Invoked by Dashboard.tsx.
 */

import { useEffect } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

export const APP_NORMAL_WIDTH = 1000;
export const APP_NORMAL_HEIGHT = 660;

const OLD_BOUNDS_STORAGE_KEY = "murmur_dashboard_window_bounds";

export async function enforceNormalWindowSize() {
  try {
    const appWindow = getCurrentWindow();

    // Clear any previously saved corrupted bounds
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(OLD_BOUNDS_STORAGE_KEY);
    }

    // Un-maximize if currently maximized so the window returns to normal desktop scale
    const isMax = await appWindow.isMaximized();
    if (isMax) {
      await appWindow.unmaximize();
    }

    // Apply the fixed normal size in Logical Pixels
    await appWindow.setSize(new LogicalSize(APP_NORMAL_WIDTH, APP_NORMAL_HEIGHT));
  } catch {
    // Ignore outside of Tauri runtime or in browser test environments
  }
}

export function useWindowBoundsPersistence() {
  useEffect(() => {
    void enforceNormalWindowSize();
  }, []);
}
