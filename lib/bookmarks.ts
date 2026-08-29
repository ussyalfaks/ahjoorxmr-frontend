const STORAGE_KEY = "ahjoor:circle-bookmarks";

// Same-tab components need a signal when localStorage changes — the native
// "storage" event only fires in *other* tabs, so we dispatch this ourselves.
export const BOOKMARKS_EVENT = "ahjoor:bookmarks-changed";

export function getBookmarkedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookmarkedIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(BOOKMARKS_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function isBookmarked(circleId: string): boolean {
  return getBookmarkedIds().includes(circleId);
}

/** Toggles the bookmark and returns the new state (true = now bookmarked). */
export function toggleBookmark(circleId: string): boolean {
  const ids = getBookmarkedIds();
  const wasBookmarked = ids.includes(circleId);
  saveBookmarkedIds(wasBookmarked ? ids.filter((id) => id !== circleId) : [...ids, circleId]);
  return !wasBookmarked;
}
