"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RECENT_SEARCHES_EVENT,
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from "@/lib/recentSearches";

/**
 * Returns the user's recent circle searches (most recent first) plus
 * helpers to add or clear them. Syncs across every component instance —
 * same tab via a custom event, other tabs via the native "storage" event —
 * the same way useBookmarks does for bookmarked ids.
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    const sync = () => setRecentSearches(getRecentSearches());
    window.addEventListener(RECENT_SEARCHES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(RECENT_SEARCHES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addSearch = useCallback((term: string) => {
    setRecentSearches(addRecentSearch(term));
  }, []);

  const clearSearches = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return { recentSearches, addSearch, clearSearches };
}