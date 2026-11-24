import { describe, it, expect, beforeEach, vi } from "vitest";
import { safeStorage } from "../safeStorage";

describe("safeStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores and retrieves string items", () => {
    expect(safeStorage.setItem("testKey", "testVal")).toBe(true);
    expect(safeStorage.getItem("testKey")).toBe("testVal");
  });

  it("removes items cleanly", () => {
    safeStorage.setItem("key1", "val1");
    expect(safeStorage.removeItem("key1")).toBe(true);
    expect(safeStorage.getItem("key1")).toBeNull();
  });

  it("handles JSON parsing and fallback gracefully", () => {
    safeStorage.setJSON("obj", { a: 1 });
    expect(safeStorage.getJSON("obj", { a: 0 })).toEqual({ a: 1 });

    expect(safeStorage.getJSON("missing", { def: true })).toEqual({ def: true });
  });

  it("gracefully catches exceptions when localStorage throws (e.g. Safari private mode)", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: Access denied");
    });
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(safeStorage.getItem("any")).toBeNull();
    expect(safeStorage.setItem("any", "val")).toBe(false);
  });
});
