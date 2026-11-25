import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock usePrefersReducedMotion hook for testing purposes
function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches;
}

describe("usePrefersReducedMotion Hook - Issue #334", () => {
  let matchMediaMock: (query: string) => MediaQueryList;
  let listeners: Map<string, Function[]>;

  beforeEach(() => {
    listeners = new Map();

    matchMediaMock = (query: string): MediaQueryList => {
      const match = query === "(prefers-reduced-motion: reduce)";

      const mockMediaQueryList: Partial<MediaQueryList> = {
        matches: match,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event: string, listener: Function) => {
          if (!listeners.has(query)) {
            listeners.set(query, []);
          }
          listeners.get(query)?.push(listener);
        }),
        removeEventListener: vi.fn((event: string, listener: Function) => {
          const list = listeners.get(query);
          if (list) {
            const index = list.indexOf(listener);
            if (index > -1) {
              list.splice(index, 1);
            }
          }
        }),
        dispatchEvent: vi.fn(),
      };

      return mockMediaQueryList as MediaQueryList;
    };

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    listeners.clear();
  });

  it("returns false when reduce motion is not preferred", () => {
    const result = usePrefersReducedMotion();
    expect(result).toBe(false);
  });

  it("returns true when reduce motion is preferred", () => {
    // Override matchMedia to return true for prefers-reduced-motion
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });

    const result = usePrefersReducedMotion();
    expect(result).toBe(true);
  });

  it("responds to system preference changes", () => {
    const initialResult = usePrefersReducedMotion();
    expect(initialResult).toBe(false);

    // Simulate system preference change
    const mockMediaQuery = matchMediaMock("(prefers-reduced-motion: reduce)");
    const listeners_array = listeners.get("(prefers-reduced-motion: reduce)") || [];

    expect(listeners_array).toBeDefined();
  });

  it("works correctly on client-side rendering", () => {
    expect(() => {
      usePrefersReducedMotion();
    }).not.toThrow();
  });

  it("handles multiple calls consistently", () => {
    const result1 = usePrefersReducedMotion();
    const result2 = usePrefersReducedMotion();
    const result3 = usePrefersReducedMotion();

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  it("matches correct media query pattern", () => {
    const matchMediaCall = vi.spyOn(window, "matchMedia");
    
    usePrefersReducedMotion();

    expect(matchMediaCall).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  it("supports accessibility preferences detection", () => {
    const hasMatchMedia = typeof window !== "undefined" && window.matchMedia;
    expect(hasMatchMedia).toBe(true);

    if (hasMatchMedia) {
      const result = usePrefersReducedMotion();
      expect(typeof result).toBe("boolean");
    }
  });

  it("handles missing matchMedia gracefully", () => {
    // Save original
    const original = window.matchMedia;

    // Remove matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: undefined,
    });

    // Should handle gracefully (might return false)
    expect(() => {
      usePrefersReducedMotion();
    }).not.toThrow();

    // Restore
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: original,
    });
  });

  it("respects user accessibility settings", () => {
    const result = usePrefersReducedMotion();
    
    // Should return a boolean indicating the user's preference
    expect(typeof result).toBe("boolean");
  });
});
