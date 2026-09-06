/**
 * SOURCE OF TRUTH KEYWORDS: useScrollRestoration, scrollPositions
 * WHAT:  Preserves and restores the scroll position of scrollable views across
 *        route navigations.
 * WHY:   When switching dashboard tabs, route views unmount and remount. Without
 *        restoration, the scroll position drops to top (0), forcing the user to
 *        re-scroll through lengthy sections like Settings.
 * WHERE: Consumed by SettingsView.tsx and other dashboard views.
 */

import { useCallback, useLayoutEffect, useRef } from "react";

const scrollPositions = new Map<string, number>();

export function useScrollRestoration(key: string, isReady: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isReady) return;
    const el = containerRef.current;
    if (!el) return;

    const saved = scrollPositions.get(key);
    if (typeof saved === "number" && saved > 0) {
      el.scrollTop = saved;
    }
  }, [key, isReady]);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      scrollPositions.set(key, e.currentTarget.scrollTop);
    },
    [key],
  );

  const resetScroll = useCallback(() => {
    scrollPositions.set(key, 0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [key]);

  return { containerRef, onScroll, resetScroll };
}
