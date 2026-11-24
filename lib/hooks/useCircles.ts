"use client";

import { useQuery } from "@tanstack/react-query";
import { getCircles, getCircle } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/** All circles (discovery + joined), via the typed API client. */
export function useCircles() {
  return useQuery({
    queryKey: queryKeys.circles.all(),
    queryFn: getCircles,
  });
}

/** A single circle by id. Disabled until an id is available. */
export function useCircle(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.circles.detail(id ?? ""),
    queryFn: () => getCircle(id as string),
    enabled: Boolean(id),
  });
}
