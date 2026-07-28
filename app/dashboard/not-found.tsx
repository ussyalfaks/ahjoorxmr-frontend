import Link from "next/link";
import { SearchX, LayoutGrid } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div
        className="mb-7 w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--ov-0a)] border border-[var(--ov-14)]"
        aria-hidden="true"
      >
        <SearchX size={30} className="text-[var(--muted)]" strokeWidth={1.75} />
      </div>

      <h1 className="font-sora font-bold text-2xl text-[var(--text)] mb-2">
        We couldn&apos;t find that page
      </h1>
      <p className="text-[var(--muted)] text-sm max-w-sm mb-8">
        It might have been moved, or the circle you&apos;re looking for is no
        longer available.
      </p>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      >
        <LayoutGrid size={16} aria-hidden="true" />
        Back to Dashboard
      </Link>
    </div>
  );
}
