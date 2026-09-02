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

  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

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
