/**
 * Currency formatting and amount rounding utilities for contribution amounts
 */

export type Currency = "USDT" | "USDC" | "DAI" | "ETH" | "BTC" | "XMR";
export type RoundingMode = "up" | "down" | "nearest";

interface CurrencyConfig {
  symbol: string;
  decimals: number;
  prefix?: boolean;
}

const CURRENCY_CONFIG: Record<Currency, CurrencyConfig> = {
  USDT: { symbol: "USDT", decimals: 2, prefix: false },
  USDC: { symbol: "USDC", decimals: 2, prefix: false },
  DAI: { symbol: "DAI", decimals: 2, prefix: false },
  ETH: { symbol: "ETH", decimals: 4, prefix: false },
  BTC: { symbol: "BTC", decimals: 8, prefix: false },
  XMR: { symbol: "XMR", decimals: 12, prefix: false },
};

/**
 * Round amount based on specified rounding mode
 */
export function roundAmount(
  amount: number,
  decimals: number = 2,
  mode: RoundingMode = "nearest"
): number {
  const multiplier = Math.pow(10, decimals);

  switch (mode) {
    case "up":
      return Math.ceil(amount * multiplier) / multiplier;
    case "down":
      return Math.floor(amount * multiplier) / multiplier;
    case "nearest":
      return Math.round(amount * multiplier) / multiplier;
    default:
      return Math.round(amount * multiplier) / multiplier;
  }
}

/**
 * Format currency amount with proper symbol and decimals
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "USDT",
  options?: {
    roundingMode?: RoundingMode;
    showSymbol?: boolean;
    compact?: boolean;
  }
): string {
  const config = CURRENCY_CONFIG[currency];
  const {
    roundingMode = "nearest",
    showSymbol = true,
    compact = false,
  } = options || {};

  // Round amount based on currency decimals
  const roundedAmount = roundAmount(amount, config.decimals, roundingMode);

  // Format with compact notation for large numbers
  let formattedNumber: string;
  if (compact && Math.abs(roundedAmount) >= 1000) {
    formattedNumber = formatCompact(roundedAmount, config.decimals);
  } else {
    formattedNumber = roundedAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: config.decimals,
    });
  }

  // Add currency symbol
  if (!showSymbol) {
    return formattedNumber;
  }

  return config.prefix
    ? `${config.symbol}${formattedNumber}`
    : `${formattedNumber} ${config.symbol}`;
}

/**
 * Format large numbers with compact notation (K, M, B)
 */
function formatCompact(amount: number, decimals: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absAmount >= 1e9) {
    return `${sign}${(absAmount / 1e9).toFixed(Math.min(decimals, 2))}B`;
  } else if (absAmount >= 1e6) {
    return `${sign}${(absAmount / 1e6).toFixed(Math.min(decimals, 2))}M`;
  } else if (absAmount >= 1e3) {
    return `${sign}${(absAmount / 1e3).toFixed(Math.min(decimals, 2))}K`;
  }

  return `${sign}${absAmount.toFixed(decimals)}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrencyAmount(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[^\d.,-]/g, "");
  // Handle different decimal separators
  const normalized = cleaned.replace(",", ".");
  return parseFloat(normalized) || 0;
}

/**
 * Format contribution amount with automatic rounding
 */
export function formatContributionAmount(
  amount: number | string,
  currency: Currency = "USDT",
  roundingMode: RoundingMode = "up"
): string {
  const numAmount = typeof amount === "string" ? parseCurrencyAmount(amount) : amount;
  return formatCurrency(numAmount, currency, { roundingMode });
}

/**
 * Calculate total with proper rounding for contributions
 */
export function calculateTotal(
  amounts: number[],
  currency: Currency = "USDT",
  roundingMode: RoundingMode = "up"
): string {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  return formatCurrency(total, currency, { roundingMode });
}

/**
 * Validate currency amount
 */
export function isValidAmount(amount: number, currency: Currency): boolean {
  if (isNaN(amount) || !isFinite(amount) || amount < 0) {
    return false;
  }

  const config = CURRENCY_CONFIG[currency];
  const decimalsStr = amount.toString().split(".")[1] || "";
  return decimalsStr.length <= config.decimals;
}

/**
 * Get currency configuration
 */
export function getCurrencyConfig(currency: Currency): CurrencyConfig {
  return CURRENCY_CONFIG[currency];
}

/**
 * Format amount range
 */
export function formatAmountRange(
  min: number,
  max: number,
  currency: Currency = "USDT"
): string {
  const formattedMin = formatCurrency(min, currency, { showSymbol: false });
  const formattedMax = formatCurrency(max, currency);
  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${roundAmount(value, decimals)}%`;
}
