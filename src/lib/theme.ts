/**
 * SOURCE OF TRUTH KEYWORDS: theme, useTheme, system-light-dark, theme-override
 * WHAT:  Theme switcher hook supporting System, Light, and Dark modes.
 * WHY:   Allows explicit theme selection that updates data-theme on :root while
 *        preserving system preference defaults.
 * WHERE: Used in SettingsView.tsx and entries.
 */

import { useState, useEffect } from "react";

export type ThemeChoice = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "murmur_theme_preference";

export function getStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export function applyTheme(theme: ThemeChoice) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }

  root.classList.toggle("dark", isDark);
}

/**
 * Apply the stored theme immediately at module import time so the correct
 * data-theme attribute is on <html> before the first React render, regardless
 * of which tab is active. Without this, the theme only applied when
 * SettingsSection (which owns useTheme) happened to mount.
 */
applyTheme(getStoredTheme());

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeChoice) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
}
