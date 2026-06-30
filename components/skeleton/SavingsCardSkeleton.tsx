import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Mirrors the shape of an active savings/circle card: title, creator row,
 * a 3-column stats row, and a CTA button — matching the real card layout
 * used in app/dashboard/circles/page.tsx.
 */
export function SavingsCardSkeleton() {
  return (
    <div className="bg-[#212124] rounded-2xl p-6 flex flex-col gap-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-1/3" />

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <Skeleton className="h-10 w-full rounded-lg mt-auto" />
    </div>
  );
}

/**
 * Convenience wrapper for a grid of savings card skeletons.
 */
export function SavingsCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SavingsCardSkeleton key={i} />
      ))}
    </div>
  );
}