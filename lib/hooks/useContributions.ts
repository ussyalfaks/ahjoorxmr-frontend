"use client";

import { useQuery } from "@tanstack/react-query";
import { getContributions } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/** All of the current wallet's contribution records. */
export function useContributions() {
  return useQuery({
    queryKey: queryKeys.contributions.all(),
    queryFn: getContributions,
  });
}
