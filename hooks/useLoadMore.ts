"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export const LIST_PAGE_SIZE = 20;

export function useLoadMore(itemCount: number, storageKey: string) {
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE);
  const [isRestored, setIsRestored] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pendingScrollY = useRef<number | null>(null);

  useEffect(() => {
    const savedCount = Number(sessionStorage.getItem(`${storageKey}:count`));
    const savedScrollY = Number(sessionStorage.getItem(`${storageKey}:scroll`));
    pendingScrollY.current = Number.isFinite(savedScrollY) && savedScrollY > 0 ? savedScrollY : null;

    // Restore the previously expanded list after client hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(Number.isFinite(savedCount) && savedCount > LIST_PAGE_SIZE ? savedCount : LIST_PAGE_SIZE);
    setIsRestored(true);
  }, [storageKey]);

  useLayoutEffect(() => {
    if (!isRestored || pendingScrollY.current === null) return;
    window.scrollTo(0, pendingScrollY.current);
    pendingScrollY.current = null;
  }, [isRestored, visibleCount]);

  useEffect(() => {
    if (!isRestored) return;

    sessionStorage.setItem(`${storageKey}:count`, String(visibleCount));
    let frame = 0;
    const saveScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        sessionStorage.setItem(`${storageKey}:scroll`, String(window.scrollY));
      });
    };

    window.addEventListener("scroll", saveScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      sessionStorage.setItem(`${storageKey}:scroll`, String(window.scrollY));
      window.removeEventListener("scroll", saveScroll);
    };
  }, [isRestored, storageKey, visibleCount]);

  const loadMore = useCallback(() => {
    const next = Math.min(visibleCount + LIST_PAGE_SIZE, itemCount);
    const loaded = next - visibleCount;
    if (loaded === 0) return;

    setVisibleCount(next);
    setAnnouncement(`Loaded ${loaded} more items. Showing ${next} of ${itemCount}.`);
  }, [itemCount, visibleCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isRestored || visibleCount >= itemCount || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isRestored, itemCount, loadMore, visibleCount]);

  return {
    visibleCount: Math.min(visibleCount, itemCount),
    hasMore: visibleCount < itemCount,
    loadMore,
    sentinelRef,
    announcement,
  };
}