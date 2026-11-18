/**
 * Centralized TanStack Query key factory. Keeping all query keys here (vs.
 * inlining array literals in every hook) makes cache invalidation after a
 * mutation unambiguous — e.g. `queryClient.invalidateQueries({ queryKey:
 * queryKeys.circles.all() })` invalidates every circles query, while
 * `queryKeys.circles.detail(id)` scopes to one.
 */
export const queryKeys = {
  circles: {
    all: () => ["circles"] as const,
    list: () => ["circles", "list"] as const,
    detail: (id: string) => ["circles", id] as const,
  },
  contributions: {
    all: () => ["contributions"] as const,
    list: () => ["contributions", "list"] as const,
  },
  payouts: {
    all: () => ["payouts"] as const,
    list: () => ["payouts", "list"] as const,
  },
  notifications: {
    all: () => ["notifications"] as const,
  },
};
