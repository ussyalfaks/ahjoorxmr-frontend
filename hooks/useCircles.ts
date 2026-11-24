/**
 * TanStack Query hooks for circles data.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";

export function useCircles() {
  return useQuery({
    queryKey: queryKeys.circles.list(),
    queryFn: () => apiClient.getCircles(),
  });
}

export function useCircle(id: string) {
  return useQuery({
    queryKey: queryKeys.circles.detail(id),
    queryFn: () => apiClient.getCircle(id),
    enabled: Boolean(id),
  });
}
