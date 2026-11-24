/**
 * TanStack Query hook for payouts data.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";

export function usePayouts() {
  return useQuery({
    queryKey: queryKeys.payouts.list(),
    queryFn: () => apiClient.getPayouts(),
  });
}
