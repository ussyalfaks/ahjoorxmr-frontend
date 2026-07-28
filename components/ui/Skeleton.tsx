export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#ffffff0a] ${className}`}
      aria-hidden="true"
    />
  );
}
