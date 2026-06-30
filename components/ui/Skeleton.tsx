import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Mirrors the shape of a stat card: an icon, a label, and a large value,
 * inside the same dark card shell used elsewhere in the dashboard.
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-[#212124] rounded-2xl p-6 flex flex-col gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-28" />
    </div>
  );
}

/**
 * Convenience wrapper for the full 4-card stats row.
 */
export function StatCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}