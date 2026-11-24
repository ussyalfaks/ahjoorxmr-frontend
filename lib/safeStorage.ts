/**
 * Safe wrapper for localStorage access that guards against SSR (window undefined),
 * SecurityError (cookies disabled / sandboxed iframes), QuotaExceededError,
 * and Safari private browsing mode restrictions.
 */

export const safeStorage = {
  /**
   * Safely retrieves an item from localStorage. Returns null if unavailable or on error.
   */
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  /**
   * Safely stores an item in localStorage. Returns true on success, false on error.
   */
  setItem(key: string, value: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Safely removes an item from localStorage.
   */
  removeItem(key: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Safely clears all items from localStorage.
   */
  clear(): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Safely parses and retrieves a JSON item with a fallback default.
   */
  getJSON<T>(key: string, fallback: T): T {
    const raw = safeStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  /**
   * Safely serializes and stores a JSON value.
   */
  setJSON<T>(key: string, value: T): boolean {
    try {
      return safeStorage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },
};
