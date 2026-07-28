import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-[var(--bg)]">
      <div className="max-w-md w-full text-center animate-fade-up">
        <div
          className="mx-auto mb-8 w-20 h-20 rounded-[20px] flex items-center justify-center animate-float"
          style={{
            background: "linear-gradient(135deg, #6c5ce7, #8b7cf8)",
            boxShadow: "0 0 32px rgba(108,92,231,0.35)",
          }}
          aria-hidden="true"
        >
          <Compass size={36} className="text-white" strokeWidth={1.75} />
        </div>

        <p className="font-['Sora'] font-bold text-[15px] tracking-[0.2em] text-[#8b7cf8] mb-3">
          404
        </p>
        <h1 className="font-['Sora'] font-bold text-[28px] md:text-[32px] text-[var(--text)] tracking-[-0.5px] mb-3">
          This circle doesn&apos;t exist
        </h1>
        <p className="text-[var(--muted)] text-[15px] leading-relaxed mb-10">
          The page you&apos;re looking for may have been moved, renamed, or
          never existed. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#6c5ce7] hover:bg-[#8b7cf8] text-white px-6 py-3 rounded-[10px] font-['Sora'] text-[14px] font-semibold tracking-[-0.2px] transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7]"
          >
            <Home size={16} aria-hidden="true" />
            Back Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 border border-[var(--border)] hover:border-[#4B6B76] text-[var(--text)] px-6 py-3 rounded-[10px] font-['Sora'] text-[14px] font-semibold tracking-[-0.2px] transition-all duration-200 hover:bg-[var(--ov-0a)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
