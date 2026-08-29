"use client";

import { useCallback, useEffect, useState } from "react";
import { BOOKMARKS_EVENT, getBookmarkedIds, toggleBookmark } from "@/lib/bookmarks";

/**
 * Returns the current set of bookmarked circle ids and a toggle function.
 * Syncs across every component instance (same tab via a custom event,
 * other tabs via the native "storage" event) so the star icon, the
 * Bookmarked tab count, and the tab list all stay consistent.
 */
export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(getBookmarkedIds());
    const sync = () => setBookmarkedIds(getBookmarkedIds());
    window.addEventListener(BOOKMARKS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BOOKMARKS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((circleId: string) => {
    const nowBookmarked = toggleBookmark(circleId);
    setBookmarkedIds(getBookmarkedIds());
    return nowBookmarked;
  }, []);

  const isBookmarked = useCallback(
    (circleId: string) => bookmarkedIds.includes(circleId),
    [bookmarkedIds]
  );

  return { bookmarkedIds, isBookmarked, toggle };
}
