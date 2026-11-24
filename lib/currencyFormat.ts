import { safeStorage } from "@/lib/safeStorage";

/**
 * Currency formatting and amount rounding utilities for contribution amounts
 */

export type Currency =
  | "USDT"
  | "USDC"
  | "DAI"
  | "ETH"
  | "BTC"
  | "XMR"
  | "USD"
  | "EUR"
  | "GBP"
  | "NGN"
  | (string & {});

export type RoundingMode = "up" | "down" | "nearest";
export type NumberLocaleMode = "system" | "custom";

export interface NumberFormatPreference {
  mode: NumberLocaleMode; // "system" follows browser/language; "custom" uses a specific locale
  locale: string;         // e.g. "en-US", "de-DE", "fr-FR"
}

export const NUMBER_FORMAT_STORAGE_KEY = "ahjoor-number-format-preference";
export const NUMBER_FORMAT_UPDATED_EVENT = "ahjoor:number-format-updated";

export const DEFAULT_NUMBER_FORMAT_PREFERENCE: NumberFormatPreference = {
  mode: "system",
  locale: "en-US",
};

export const SUPPORTED_LOCALES = [
  { value: "en-US", label: "English (United States)", example: "1,234.56" },
  { value: "en-GB", label: "English (United Kingdom)", example: "1,234.56" },
  { value: "de-DE", label: "German (Germany)", example: "1.234,56" },
  { value: "fr-FR", label: "French (France)", example: "1 234,56" },
  { value: "es-ES", label: "Spanish (Spain)", example: "1.234,56" },
  { value: "it-IT", label: "Italian (Italy)", example: "1.234,56" },
  { value: "pt-BR", label: "Portuguese (Brazil)", example: "1.234,56" },
  { value: "nl-NL", label: "Dutch (Netherlands)", example: "1.234,56" },
  { value: "ja-JP", label: "Japanese (Japan)", example: "1,234.56" },
  { value: "zh-CN", label: "Chinese (China)", example: "1,234.56" },
  { value: "hi-IN", label: "Hindi (India)", example: "1,23,456.78" },
  { value: "ar-EG", label: "Arabic (Egypt)", example: "1,234.56" },
] as const;

/**
 * Detect the browser / system language locale
 */
export function getSystemLocale(): string {
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    return navigator.language || (navigator.languages && navigator.languages[0]) || "en-US";
  }
  return "en-US";
}

/**
 * Retrieve user's number format preference
 */
export function getNumberFormatPreference(): NumberFormatPreference {
  const raw = safeStorage.getItem(NUMBER_FORMAT_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.mode === "system" || parsed.mode === "custom")) {
        return {
          mode: parsed.mode,
          locale: typeof parsed.locale === "string" && parsed.locale ? parsed.locale : "en-US",
        };
      }
    } catch {
      // Fallback to default
    }
  }
  return DEFAULT_NUMBER_FORMAT_PREFERENCE;
}

/**
 * Update user's number format preference and dispatch change event
 */
export function setNumberFormatPreference(pref: Partial<NumberFormatPreference>): void {
  const current = getNumberFormatPreference();
  const next: NumberFormatPreference = {
    mode: pref.mode ?? current.mode,
    locale: pref.locale ?? current.locale,
  };
  safeStorage.setItem(NUMBER_FORMAT_STORAGE_KEY, JSON.stringify(next));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NUMBER_FORMAT_UPDATED_EVENT, { detail: next }));
  }
}

/**
 * Get active locale for number formatting
 */
export function getEffectiveNumberLocale(): string {
  const pref = getNumberFormatPreference();
  if (pref.mode === "system") {
    return getSystemLocale();
  }
  return pref.locale || "en-US";
}

interface CurrencyConfig {
  symbol: string;
  decimals: number;
  prefix?: boolean;
}

const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  USDT: { symbol: "USDT", decimals: 2, prefix: false },
  USDC: { symbol: "USDC", decimals: 2, prefix: false },
  DAI: { symbol: "DAI", decimals: 2, prefix: false },
  ETH: { symbol: "ETH", decimals: 4, prefix: false },
  BTC: { symbol: "BTC", decimals: 8, prefix: false },
  XMR: { symbol: "XMR", decimals: 12, prefix: false },
  USD: { symbol: "$", decimals: 2, prefix: true },
  EUR: { symbol: "€", decimals: 2, prefix: false },
  GBP: { symbol: "£", decimals: 2, prefix: true },
  NGN: { symbol: "₦", decimals: 2, prefix: true },
};

/**
 * Get currency configuration
 */
export function getCurrencyConfig(currency: string): CurrencyConfig {
  const upper = (currency || "").toUpperCase();
  return CURRENCY_CONFIG[upper] || { symbol: currency, decimals: 2, prefix: false };
}

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

export interface FormatCurrencyOptions {
  roundingMode?: RoundingMode;
  showSymbol?: boolean;
  compact?: boolean;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format currency amount with proper symbol, decimals, and locale
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "USDT",
  options?: FormatCurrencyOptions
): string {
  const config = getCurrencyConfig(currency);
  const {
    roundingMode = "nearest",
    showSymbol = true,
    compact = false,
    locale = getEffectiveNumberLocale(),
    minimumFractionDigits,
    maximumFractionDigits,
  } = options || {};

  const maxDecimals = maximumFractionDigits !== undefined ? maximumFractionDigits : config.decimals;
  const minDecimals = minimumFractionDigits !== undefined ? minimumFractionDigits : 0;

  // Round amount based on currency decimals
  const roundedAmount = roundAmount(amount, maxDecimals, roundingMode);

  // Format with compact notation for large numbers
  let formattedNumber: string;
  if (compact && Math.abs(roundedAmount) >= 1000) {
    formattedNumber = formatCompact(roundedAmount, maxDecimals, locale);
  } else {
    formattedNumber = roundedAmount.toLocaleString(locale, {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
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
 * Format large numbers with compact notation (K, M, B) respecting locale
 */
function formatCompact(amount: number, decimals: number, locale: string): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const maxDigits = Math.min(decimals, 2);

  if (absAmount >= 1e9) {
    const val = absAmount / 1e9;
    return `${sign}${val.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: maxDigits })}B`;
  } else if (absAmount >= 1e6) {
    const val = absAmount / 1e6;
    return `${sign}${val.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: maxDigits })}M`;
  } else if (absAmount >= 1e3) {
    const val = absAmount / 1e3;
    return `${sign}${val.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: maxDigits })}K`;
  }

  return `${sign}${absAmount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: decimals })}`;
}

/**
 * Format generic numbers respecting active or provided locale
 */
export function formatNumber(
  amount: number,
  options?: Intl.NumberFormatOptions & { locale?: string }
): string {
  const { locale = getEffectiveNumberLocale(), ...rest } = options || {};
  return amount.toLocaleString(locale, rest);
}

/**
 * Format amount with optional currency symbol and options
 */
export function formatAmount(
  amount: number,
  currency?: string,
  options?: FormatCurrencyOptions
): string {
  if (!currency) {
    return formatNumber(amount, options ? {
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
      locale: options.locale,
    } : undefined);
  }
  return formatCurrency(amount, currency, options);
}

/**
 * Parse currency string to number, intelligently handling both comma and dot decimal separators
 */
export function parseCurrencyAmount(value: string | number): number {
  if (typeof value === "number") {
    return isNaN(value) ? 0 : value;
  }
  if (!value) return 0;

  let str = String(value).trim();
  const isNegative = str.startsWith("-") || str.includes("-");

  // Keep only digits, period, comma
  str = str.replace(/[^\d.,]/g, "");
  if (!str) return 0;

  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");

  let normalized = str;

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      // 1.234,56 -> dots are thousands, comma is decimal
      normalized = str.replace(/\./g, "").replace(",", ".");
    } else {
      // 1,234.56 -> commas are thousands, dot is decimal
      normalized = str.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    const parts = str.split(",");
    if (parts.length > 2) {
      normalized = str.replace(/,/g, "");
    } else if (parts[1] && parts[1].length !== 3) {
      normalized = str.replace(",", ".");
    } else {
      const sample = (1.1).toLocaleString(getEffectiveNumberLocale());
      if (sample.includes(",")) {
        normalized = str.replace(",", ".");
      } else {
        normalized = str.replace(/,/g, "");
      }
    }
  } else if (lastDot > -1) {
    const parts = str.split(".");
    if (parts.length > 2) {
      normalized = str.replace(/\./g, "");
    } else if (parts[1] && parts[1].length === 3) {
      const sample = (1.1).toLocaleString(getEffectiveNumberLocale());
      if (sample.includes(",") && parts[0].length <= 3) {
        normalized = str.replace(/\./g, "");
      }
    }
  }

  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return 0;
  return isNegative ? -Math.abs(parsed) : parsed;
}

/**
 * Convert any amount representation into a clean machine-readable number string (e.g. "1234.56" or "-50.00")
 * Ensures CSV exports keep machine-readable numbers regardless of active locale settings.
 */
export function toMachineReadableAmount(value: number | string): string {
  if (typeof value === "number") {
    return isNaN(value) ? "" : String(value);
  }
  if (!value) return "";
  const trimmed = String(value).trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }
  if (!/\d/.test(trimmed)) {
    return trimmed;
  }
  const num = parseCurrencyAmount(trimmed);
  const cleaned = trimmed.replace(/[^\d.,]/g, "");
  const lastSep = Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","));
  if (lastSep > -1) {
    const decimals = cleaned.slice(lastSep + 1);
    if (decimals.length > 0 && decimals.length <= 8 && decimals.length !== 3) {
      return num.toFixed(decimals.length);
    }
  }
  return String(num);
}

/**
 * Format contribution amount with automatic rounding
 */
export function formatContributionAmount(
  amount: number | string,
  currency: Currency = "USDT",
  roundingMode: RoundingMode = "up",
  options?: Omit<FormatCurrencyOptions, "roundingMode">
): string {
  const numAmount = typeof amount === "string" ? parseCurrencyAmount(amount) : amount;
  return formatCurrency(numAmount, currency, { roundingMode, ...options });
}

/**
 * Calculate total with proper rounding for contributions
 */
export function calculateTotal(
  amounts: number[],
  currency: Currency = "USDT",
  roundingMode: RoundingMode = "up",
  options?: Omit<FormatCurrencyOptions, "roundingMode">
): string {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  return formatCurrency(total, currency, { roundingMode, ...options });
}

/**
 * Validate currency amount
 */
export function isValidAmount(amount: number, currency: Currency): boolean {
  if (isNaN(amount) || !isFinite(amount) || amount < 0) {
    return false;
  }

  const config = getCurrencyConfig(currency);
  const decimalsStr = amount.toString().split(".")[1] || "";
  return decimalsStr.length <= config.decimals;
}

/**
 * Format amount range
 */
export function formatAmountRange(
  min: number,
  max: number,
  currency: Currency = "USDT",
  options?: FormatCurrencyOptions
): string {
  const formattedMin = formatCurrency(min, currency, { showSymbol: false, ...options });
  const formattedMax = formatCurrency(max, currency, options);
  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
  locale?: string
): string {
  const rounded = roundAmount(value, decimals);
  return `${formatNumber(rounded, {
    locale,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })}%`;
}
