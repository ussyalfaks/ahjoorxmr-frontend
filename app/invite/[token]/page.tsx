"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { redeemInviteLink, type InviteStatus } from "@/lib/inviteLinks";

const MESSAGES: Record<Exclude<InviteStatus, "active">, { title: string; body: string }> = {
  expired: { title: "This invite link has expired", body: "Invite links are only valid for a limited time. Ask the circle organizer for a new link." },
  revoked: { title: "This invite link was revoked", body: "The organizer has disabled this link. Ask them for a new invite if you still want to join." },
  exhausted: { title: "This invite link has been used up", body: "The link reached its maximum number of uses. Ask the organizer for a new invite." },
  not_found: { title: "Invite link not found", body: "This link is invalid or has been removed. Double-check the URL or ask the organizer for a new invite." },
};

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<InviteStatus | null>(null);
  // Guards against StrictMode's double effect run recording two uses.
  const redeemed = useRef(false);

  useEffect(() => {
    if (redeemed.current) return;
    redeemed.current = true;
    const redeem = () => {
      const result = redeemInviteLink(token);
      if (result.status === "active" && result.link) {
        router.replace(`/dashboard/circles?invite=${result.link.circleId}`);
      }
      setStatus(result.status);
    };
    redeem();
  }, [token, router]);

  if (status === null || status === "active") {
    return <main className="min-h-screen flex items-center justify-center text-[var(--muted)]">Checking invite…</main>;
  }

  const msg = MESSAGES[status];
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[var(--ov-0a)] flex items-center justify-center">
          <LinkIcon size={22} className="text-[var(--muted)]" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold font-sora text-[var(--text)] mb-2">{msg.title}</h1>
        <p className="text-[var(--muted)] mb-6">{msg.body}</p>
        <Link href="/dashboard/circles?tab=discover" className="inline-block px-5 py-2.5 rounded-lg bg-[#4B6B76] text-white text-sm font-medium">
          Browse circles
        </Link>
      </div>
    </main>
  );
}
