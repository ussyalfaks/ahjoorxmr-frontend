"use client";

import { useQuery } from "@tanstack/react-query";
import { getPayouts } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/** The current wallet's payout history. */
export function usePayouts() {
  return useQuery({
    queryKey: queryKeys.payouts.all(),
    queryFn: getPayouts,
  });
}
