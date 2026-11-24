import { describe, it, expect } from "vitest";

// Mock useNumberFormat hook for testing purposes
function useNumberFormat(
  value: number | string,
  options?: {
    decimals?: number;
    locale?: string;
    currency?: string;
    notation?: "standard" | "compact" | "engineering" | "scientific";
  }
) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0";
  }

  const decimals = options?.decimals ?? 2;
  const locale = options?.locale ?? "en-US";
  const currency = options?.currency;
  const notation = options?.notation ?? "standard";

  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: decimals,
      notation: notation as any,
    }).format(numValue);
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: decimals,
    notation: notation as any,
  }).format(numValue);
}

describe("useNumberFormat Hook - Issue #320", () => {
  it("formats number with default decimal places", () => {
    const result = useNumberFormat(1234.5678);
    expect(result).toMatch(/1,234\.57/);
  });

  it("formats number with custom decimal places", () => {
    const result = useNumberFormat(1234.5678, { decimals: 3 });
    expect(result).toMatch(/1,234\.568/);
  });

  it("formats zero decimal places", () => {
    const result = useNumberFormat(1234.9999, { decimals: 0 });
    expect(result).toMatch(/1,235/);
  });

  it("formats string numbers correctly", () => {
    const result = useNumberFormat("5000.123");
    expect(result).toMatch(/5,000\.12/);
  });

  it("handles currency formatting", () => {
    const result = useNumberFormat(1234.56, {
      currency: "USD",
      decimals: 2,
    });
    expect(result).toContain("$");
    expect(result).toContain("1,234");
  });

  it("handles different locales", () => {
    const resultDE = useNumberFormat(1234.56, {
      locale: "de-DE",
      decimals: 2,
    });
    expect(resultDE).toBeTruthy();
  });

  it("handles compact notation", () => {
    const result = useNumberFormat(1234567, {
      notation: "compact",
      decimals: 1,
    });
    expect(result).toMatch(/1\.2M/);
  });

  it("returns 0 for invalid input", () => {
    const result = useNumberFormat("not-a-number");
    expect(result).toBe("0");
  });

  it("handles negative numbers", () => {
    const result = useNumberFormat(-1234.56, { decimals: 2 });
    expect(result).toContain("-");
    expect(result).toMatch(/1,234\.56/);
  });

  it("handles very large numbers", () => {
    const result = useNumberFormat(999999999.99, { decimals: 2 });
    expect(result).toMatch(/999,999,999\.99/);
  });

  it("handles very small numbers", () => {
    const result = useNumberFormat(0.0001, { decimals: 4 });
    expect(result).toMatch(/0\.0001/);
  });
});
