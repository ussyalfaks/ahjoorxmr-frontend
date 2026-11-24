"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyEmailToken, type VerifyResult } from "@/lib/emailVerification";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [result, setResult] = useState<VerifyResult | "checking">("checking");

  useEffect(() => {
    if (!token) {
      setResult("invalid");
      return;
    }
    // Updates the shared localStorage state (and fires the
    // ahjoor:email-verification-changed event), so the banner and any
    // gated actions unblock immediately — no re-login or reload needed.
    setResult(verifyEmailToken(token));
  }, [token]);

  if (result === "checking") {
    return (
      <>
        <div className="w-16 h-16 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <Loader2 size={28} className="text-[var(--muted)] animate-spin" />
        </div>
        <h1 className="text-2xl font-bold font-sora mb-2">Verifying your email…</h1>
      </>
    );
  }

  if (result === "success") {
    return (
      <>
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold font-sora mb-2">Email verified</h1>
        <p className="text-[var(--muted)] text-sm mb-8">
          Your email address is confirmed. You can now create and join circles, and you&apos;re
          all set to receive contribution and payout notifications.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6" aria-hidden="true">
        <XCircle size={28} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-bold font-sora mb-2">
        {result === "expired" ? "Link expired" : "Invalid verification link"}
      </h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        {result === "expired"
          ? "This verification link has expired. Request a new one from your dashboard."
          : "This verification link isn't valid. Request a new one from your dashboard."}
      </p>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-6">
      <div className="text-center max-w-sm">
        <Suspense>
          <VerifyEmailContent />
        </Suspense>
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