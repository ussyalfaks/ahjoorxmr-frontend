"use client";

import { useMemo } from "react";
import { Gift, Users, Award, Send } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import { useWallet } from "@/contexts/WalletContext";

type ReferralStatus = "invited" | "joined" | "active";

interface Referral {
  id: string;
  name: string;
  status: ReferralStatus;
  date: string;
}

// Mock data — structured to match a future GET /api/referrals response.
const MOCK_REFERRALS: Referral[] = [
  { id: "1", name: "amaka.stark", status: "active", date: "2026-07-20" },
  { id: "2", name: "0x4a2f...9c3d", status: "joined", date: "2026-07-15" },
  { id: "3", name: "tunde.stark", status: "invited", date: "2026-07-24" },
];

const STATUS_STYLES: Record<ReferralStatus, string> = {
  invited: "bg-[var(--ov-0f)] text-[var(--muted)]",
  joined: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  active: "bg-green-500/10 text-green-600 dark:text-green-400",
};

const STATUS_LABEL: Record<ReferralStatus, string> = {
  invited: "Invited",
  joined: "Joined",
  active: "Active",
};

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ReferralsPage() {
  const { address } = useWallet();

  const referralCode = useMemo(() => {
    if (!address) return "AHJOOR-GUEST";
    return `AHJOOR-${address.slice(2, 8).toUpperCase()}`;
  }, [address]);

  const referralLink = `https://ahjoor.app/join?ref=${referralCode}`;

  const referrals = MOCK_REFERRALS;
  const successfulReferrals = referrals.filter((r) => r.status === "active" || r.status === "joined").length;
  const activeReferrals = referrals.filter((r) => r.status === "active").length;
  const bonusEarned = successfulReferrals * 2;

  const shareText = encodeURIComponent(`Join me on Ahjoor and save together — use my link: ${referralLink}`);
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div className="space-y-10 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold font-sora text-[var(--text)]">Referral Program</h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          Invite friends to Ahjoor and earn rewards when they join a circle.
        </p>
      </div>

      {/* Referral link */}
      <div className="bg-[var(--modal)] p-6 rounded-2xl">
        <p className="text-[var(--muted)] text-sm font-medium mb-3">Your referral link</p>
        <div className="flex items-center gap-2 bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-3">
          <span className="flex-1 truncate text-sm text-[var(--text)] font-mono">{referralLink}</span>
          <CopyButton value={referralLink} />
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <a
            href={telegramShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ov-0a)] border border-[var(--ov-14)] text-sm font-medium text-[var(--text)] hover:bg-[var(--ov-12)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <Send size={15} aria-hidden="true" />
            Telegram
          </a>
          <a
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ov-0a)] border border-[var(--ov-14)] text-sm font-medium text-[var(--text)] hover:bg-[var(--ov-12)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <XIcon />
            X (Twitter)
          </a>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ov-0a)] border border-[var(--ov-14)] text-sm font-medium text-[var(--text)]">
            Copy Link
            <CopyButton value={referralLink} />
          </div>
        </div>
      </div>

      {/* Rewards summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--modal)] p-6 rounded-2xl flex flex-col">
          <div className="w-10 h-10 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
            <Users size={20} className="text-[var(--text)]" aria-hidden="true" />
          </div>
          <p className="text-[var(--muted)] text-sm font-medium mb-2">Successful Referrals</p>
          <h3 className="text-3xl font-semibold font-sora tracking-tight text-[var(--text)]">
            {successfulReferrals}
          </h3>
        </div>

        <div className="bg-[var(--modal)] p-6 rounded-2xl flex flex-col">
          <div className="w-10 h-10 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
            <Award size={20} className="text-[var(--text)]" aria-hidden="true" />
          </div>
          <p className="text-[var(--muted)] text-sm font-medium mb-2">Active Referrals</p>
          <h3 className="text-3xl font-semibold font-sora tracking-tight text-[var(--text)]">
            {activeReferrals}
          </h3>
        </div>

        <div className="bg-[var(--modal)] p-6 rounded-2xl flex flex-col">
          <div className="w-10 h-10 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
            <Gift size={20} className="text-[var(--text)]" aria-hidden="true" />
          </div>
          <p className="text-[var(--muted)] text-sm font-medium mb-2">Bonus Earned</p>
          <h3 className="text-3xl font-semibold font-sora tracking-tight text-[var(--text)]">
            {bonusEarned} USDT
          </h3>
        </div>
      </div>

      {/* Referred users list */}
      <div>
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold font-sora text-[var(--text)] shrink-0">Your referrals</h2>
          <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
        </div>

        {referrals.length === 0 ? (
          <div className="bg-[var(--modal)] rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <Gift size={26} className="text-[var(--muted)]" />
            </div>
            <h3 className="text-lg font-bold font-sora text-[var(--text)] mb-1">No referrals yet</h3>
            <p className="text-[var(--muted)] text-sm max-w-sm mx-auto">
              Share your referral link with friends — once they join a circle, they&apos;ll show up here.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--modal)] rounded-2xl overflow-hidden">
            <div className="divide-y divide-[var(--ov-0f)]">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{r.name}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Invited {r.date}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
