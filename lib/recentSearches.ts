const STORAGE_KEY = "ahjoor:circle-recent-searches";
const MAX_RECENT = 6;

// Same-tab components need a signal when localStorage changes — the native
// "storage" event only fires in *other* tabs, so we dispatch this ourselves.
export const RECENT_SEARCHES_EVENT = "ahjoor:recent-searches-changed";

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === "string")
      : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(terms: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
    window.dispatchEvent(new Event(RECENT_SEARCHES_EVENT));
  } catch {
    // ignore storage errors
  }
}

/**
 * Adds a term to the front of the recent-searches list. De-dupes
 * case-insensitively (a repeated search just moves back to the top)
 * and caps the list at MAX_RECENT. Returns the new list.
 */
export function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return getRecentSearches();

  const existing = getRecentSearches().filter(
    (t) => t.toLowerCase() !== trimmed.toLowerCase()
  );
  const next = [trimmed, ...existing].slice(0, MAX_RECENT);
  saveRecentSearches(next);
  return next;
}

export function clearRecentSearches(): void {
  saveRecentSearches([]);
}