"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNumberFormatPreference,
  setNumberFormatPreference,
  getEffectiveNumberLocale,
  formatCurrency,
  formatNumber,
  formatAmount,
  NUMBER_FORMAT_UPDATED_EVENT,
  type NumberFormatPreference,
  type FormatCurrencyOptions,
  type Currency,
} from "@/lib/currencyFormat";

/**
 * Hook to consume and update number formatting preferences,
 * keeping components re-rendered when the active locale changes.
 */
export function useNumberFormat() {
  const [preference, setPreferenceState] = useState<NumberFormatPreference>(() =>
    getNumberFormatPreference()
  );
  const [effectiveLocale, setEffectiveLocale] = useState<string>(() =>
    getEffectiveNumberLocale()
  );

  const reload = useCallback(() => {
    setPreferenceState(getNumberFormatPreference());
    setEffectiveLocale(getEffectiveNumberLocale());
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(NUMBER_FORMAT_UPDATED_EVENT, reload);
    return () => window.removeEventListener(NUMBER_FORMAT_UPDATED_EVENT, reload);
  }, [reload]);

  const updatePreference = useCallback(
    (next: Partial<NumberFormatPreference>) => {
      setNumberFormatPreference(next);
      reload();
    },
    [reload]
  );

  const formatCurrencyLocale = useCallback(
    (amount: number, currency: Currency = "USDT", options?: FormatCurrencyOptions) => {
      return formatCurrency(amount, currency, { locale: effectiveLocale, ...options });
    },
    [effectiveLocale]
  );

  const formatNumberLocale = useCallback(
    (amount: number, options?: Intl.NumberFormatOptions & { locale?: string }) => {
      return formatNumber(amount, { locale: effectiveLocale, ...options });
    },
    [effectiveLocale]
  );

  const formatAmountLocale = useCallback(
    (amount: number, currency?: string, options?: FormatCurrencyOptions) => {
      return formatAmount(amount, currency, { locale: effectiveLocale, ...options });
    },
    [effectiveLocale]
  );

  return {
    preference,
    effectiveLocale,
    setPreference: updatePreference,
    formatCurrency: formatCurrencyLocale,
    formatNumber: formatNumberLocale,
    formatAmount: formatAmountLocale,
  };
}
