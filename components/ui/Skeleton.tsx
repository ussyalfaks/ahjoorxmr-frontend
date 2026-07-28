export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--ov-0a)] ${className}`}
      aria-hidden="true"
    />
  );
}
