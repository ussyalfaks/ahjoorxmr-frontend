"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PAYOUT_METHOD,
  PAYOUT_METHOD_UPDATED_EVENT,
  getEffectivePayoutMethod,
  getPayoutMethodPreference,
  savePayoutMethodPreference,
} from "@/lib/payoutMethods";
import type { PayoutMethodId } from "@/types/payoutMethod";

/** Reads and updates a circle's payout method, kept in sync across components. */
export function usePayoutMethod(circleId: string, currency: string) {
  const [method, setMethod] = useState<PayoutMethodId>(DEFAULT_PAYOUT_METHOD);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const reload = useCallback(() => {
    setMethod(getEffectivePayoutMethod(circleId, currency));
    setUpdatedAt(getPayoutMethodPreference(circleId)?.updatedAt ?? null);
  }, [circleId, currency]);

  useEffect(() => {
    reload();
    window.addEventListener(PAYOUT_METHOD_UPDATED_EVENT, reload);
    return () => window.removeEventListener(PAYOUT_METHOD_UPDATED_EVENT, reload);
  }, [reload]);

  const save = useCallback(
    (next: PayoutMethodId) => savePayoutMethodPreference(circleId, next),
    [circleId]
  );

  return { method, updatedAt, save };
}
