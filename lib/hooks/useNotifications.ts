"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/** The current wallet's notification inbox. */
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn: getNotifications,
  });
}
