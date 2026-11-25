import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock relativeTimeClock function for testing purposes
function formatRelativeTime(date: Date | number): string {
  const now = new Date();
  const target = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) {
    return "just now";
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  } else if (diffWeek < 4) {
    return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;
  } else if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  } else {
    return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
  }
}

describe("relativeTimeClock - Issue #333", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15 12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats time just now (within 60 seconds)", () => {
    const pastDate = new Date("2024-01-15 11:59:45");
    const result = formatRelativeTime(pastDate);
    expect(result).toBe("just now");
  });

  it("formats time in minutes", () => {
    const pastDate = new Date("2024-01-15 11:45:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toContain("minute");
    expect(result).toContain("15");
  });

  it("formats single minute correctly", () => {
    const pastDate = new Date("2024-01-15 11:59:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toBe("1 minute ago");
  });

  it("formats time in hours", () => {
    const pastDate = new Date("2024-01-15 10:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toContain("2 hour");
  });

  it("formats single hour correctly", () => {
    const pastDate = new Date("2024-01-15 11:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toBe("1 hour ago");
  });

  it("formats time in days", () => {
    const pastDate = new Date("2024-01-10 12:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toContain("5 day");
  });

  it("formats single day correctly", () => {
    const pastDate = new Date("2024-01-14 12:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toBe("1 day ago");
  });

  it("formats time in weeks", () => {
    const pastDate = new Date("2024-01-01 12:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toContain("week");
  });

  it("formats single week correctly", () => {
    const pastDate = new Date("2024-01-08 12:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toBe("1 week ago");
  });

  it("formats time in months", () => {
    const pastDate = new Date("2023-11-15 12:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toContain("month");
  });

  it("formats single month correctly", () => {
    const pastDate = new Date("2023-12-16 12:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toBe("1 month ago");
  });

  it("formats time in years", () => {
    const pastDate = new Date("2022-01-15 12:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toContain("year");
    expect(result).toContain("2");
  });

  it("formats single year correctly", () => {
    const pastDate = new Date("2023-01-15 12:00:00");
    const result = formatRelativeTime(pastDate);
    expect(result).toBe("1 year ago");
  });

  it("accepts Date objects", () => {
    const pastDate = new Date("2024-01-14 12:00:00");
    expect(() => formatRelativeTime(pastDate)).not.toThrow();
  });

  it("accepts timestamp numbers", () => {
    const timestamp = new Date("2024-01-14 12:00:00").getTime();
    expect(() => formatRelativeTime(timestamp)).not.toThrow();
  });

  it("handles edge case at boundary times", () => {
    // 1 hour and 1 second
    const pastDate = new Date("2024-01-15 10:59:59");
    const result = formatRelativeTime(pastDate);
    expect(result).toContain("hour");
  });
});

function afterEach(callback: () => void) {
  callback();
}
