import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "You're offline — Ahjoor",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <WifiOff size={28} className="text-[var(--muted)]" />
        </div>
        <h1 className="text-2xl font-bold font-sora mb-2">You&apos;re offline</h1>
        <p className="text-[var(--muted)] text-sm mb-8">
          We couldn&apos;t reach the network and don&apos;t have this page saved yet. Reconnect
          and try again — pages you&apos;ve already visited will still work offline.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
