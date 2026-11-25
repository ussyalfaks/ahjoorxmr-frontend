import { describe, it, expect } from "vitest";

// Mock currencyFormat function for testing purposes
function currencyFormat(amount: number | string, currency: string = "USD", decimals: number = 2): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);
}

describe("currencyFormat - Issue #336", () => {
  it("formats USD currency with default decimals", () => {
    const result = currencyFormat(1234.56);
    expect(result).toBe("$1,234.56");
  });

  it("formats USD with custom decimal places", () => {
    const result = currencyFormat(1234.5678, "USD", 3);
    expect(result).toContain("1,234");
    expect(result).toContain("568");
  });

  it("formats zero amount correctly", () => {
    const result = currencyFormat(0);
    expect(result).toContain("$");
    expect(result).toContain("0");
  });

  it("formats negative amounts with minus sign", () => {
    const result = currencyFormat(-1234.56);
    expect(result).toContain("-");
    expect(result).toContain("1,234");
  });

  it("formats string numbers correctly", () => {
    const result = currencyFormat("5000.12");
    expect(result).toBe("$5,000.12");
  });

  it("handles very large numbers", () => {
    const result = currencyFormat(999999999.99);
    expect(result).toContain("999,999,999");
  });

  it("handles very small numbers", () => {
    const result = currencyFormat(0.01);
    expect(result).toContain("0.01");
  });

  it("rounds correctly when decimals are exceeded", () => {
    const result = currencyFormat(10.126, "USD", 2);
    expect(result).toContain("10.13"); // Rounds up
  });

  it("returns 0 for invalid input", () => {
    const result = currencyFormat("not-a-number");
    expect(result).toBe("$0.00");
  });

  it("supports different currencies", () => {
    const usd = currencyFormat(100, "USD");
    const eur = currencyFormat(100, "EUR");
    
    expect(usd).toContain("$");
    expect(eur).toContain("€");
  });

  it("handles zero decimal places", () => {
    const result = currencyFormat(1234.5678, "USD", 0);
    expect(result).toContain("1,235"); // Rounds to nearest integer
  });
});
