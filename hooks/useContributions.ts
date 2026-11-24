/**
 * TanStack Query hook for contributions data.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";

export function useContributions() {
  return useQuery({
    queryKey: queryKeys.contributions.list(),
    queryFn: () => apiClient.getContributions(),
  });
}
