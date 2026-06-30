"use client";

import { use, useState } from "react";
import { ArrowLeft, Check, X as XIcon, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import ActivityFeed from "@/components/circles/ActivityFeed";
import CountdownTimer from "@/components/ui/CountdownTimer";
import type { CircleEvent } from "@/types/circle";

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

const now = Date.now();

interface Participant {
  address: string;
  slot: number;
  paid: boolean;
}

interface RoundHistoryRow {
  round: number;
  recipient: string;
  amount: string;
  completedAt: string;
}

interface CircleDetail {
  id: string;
  name: string;
  creator: string;
  status: "active" | "completed" | "pending";
  createdAt: string;
  participants: Participant[];
  totalSlots: number;
  contribution: string;
  duration: string;
  roundHistory: RoundHistoryRow[];
  currentRound: number;
  totalRounds: number;
  nextPayoutRecipient: string;
  nextPayoutDeadline: Date | null;
  isOrganizer: boolean;
  isMember: boolean;
}

const MOCK_EVENTS: CircleEvent[] = [
  { id: "1", type: "round_started", actor: "system", timestamp: new Date(now - 2 * 60 * 60 * 1000) },
  { id: "2", type: "member_joined", actor: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", timestamp: new Date(now - 1.5 * 60 * 60 * 1000) },
  { id: "3", type: "contribution_made", actor: CURRENT_WALLET, timestamp: new Date(now - 45 * 60 * 1000), meta: { amount: "50 USDT" } },
  { id: "4", type: "contribution_made", actor: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", timestamp: new Date(now - 30 * 60 * 1000), meta: { amount: "50 USDT" } },
  { id: "5", type: "payout_sent", actor: CURRENT_WALLET, timestamp: new Date(now - 10 * 60 * 1000), meta: { amount: "100 USDT" } },
];

const CIRCLES: Record<string, CircleDetail> = {
  "1": {
    id: "1",
    name: "Family savings",
    creator: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    status: "active",
    createdAt: "Jan 15, 2025",
    participants: [
      { address: CURRENT_WALLET, slot: 1, paid: true },
      { address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", slot: 2, paid: true },
      { address: "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8", slot: 3, paid: false },
    ],
    totalSlots: 5,
    contribution: "50 USDT",
    duration: "2 Days",
    roundHistory: [
      { round: 1, recipient: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", amount: "150 USDT", completedAt: "Jan 17, 2025" },
    ],
    currentRound: 2,
    totalRounds: 5,
    nextPayoutRecipient: CURRENT_WALLET,
    nextPayoutDeadline: new Date(now + 2 * 24 * 60 * 60 * 1000),
    isOrganizer: false,
    isMember: true,
  },
  "2": {
    id: "2",
    name: "School fees",
    creator: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1",
    status: "active",
    createdAt: "Feb 3, 2025",
    participants: [
      { address: CURRENT_WALLET, slot: 1, paid: false },
      { address: "0x222def3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9", slot: 2, paid: true },
      { address: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", slot: 3, paid: true },
      { address: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", slot: 4, paid: false },
    ],
    totalSlots: 6,
    contribution: "40 USDT",
    duration: "12 Days",
    roundHistory: [
      { round: 1, recipient: "0x222def3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9", amount: "240 USDT", completedAt: "Feb 15, 2025" },
      { round: 2, recipient: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", amount: "240 USDT", completedAt: "Feb 27, 2025" },
    ],
    currentRound: 3,
    totalRounds: 6,
    nextPayoutRecipient: CURRENT_WALLET,
    nextPayoutDeadline: new Date(now + 18 * 60 * 60 * 1000),
    isOrganizer: false,
    isMember: true,
  },
  "3": {
    id: "3",
    name: "Community Fund",
    creator: CURRENT_WALLET,
    status: "active",
    createdAt: "Mar 1, 2025",
    participants: [
      { address: CURRENT_WALLET, slot: 1, paid: true },
      { address: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", slot: 2, paid: true },
      { address: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", slot: 3, paid: false },
    ],
    totalSlots: 10,
    contribution: "25 USDT",
    duration: "5 Days",
    roundHistory: [],
    currentRound: 1,
    totalRounds: 10,
    nextPayoutRecipient: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
    nextPayoutDeadline: new Date(now + 5 * 24 * 60 * 60 * 1000),
    isOrganizer: true,
    isMember: true,
  },
};

const STATUS_STYLES: Record<CircleDetail["status"], string> = {
  active: "bg-green-500/10 text-green-400",
  pending: "bg-amber-500/10 text-amber-400",
  completed: "bg-[#ffffff0a] text-[#A1A1AA]",
};

function fmt(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function InviteLinkButton({ circleId }: { circleId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/dashboard/circles?invite=${circleId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-4 py-2 bg-[#ffffff0a] hover:bg-[#ffffff14] text-sm text-white font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-400" aria-hidden="true" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <LinkIcon size={14} aria-hidden="true" />
          Copy Invite Link
        </>
      )}
    </button>
  );
}

function ParticipantRow({ participant }: { participant: Participant }) {
  const isCurrentUser = participant.address === CURRENT_WALLET;
  return (
    <div className="flex items-center justify-between bg-[#212124] px-5 py-3 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#ffffff0a] flex items-center justify-center text-xs font-bold text-[#A1A1AA]">
          {participant.slot}
        </div>
        <span className="font-mono text-sm text-[#EBEBEB]">
          {fmt(participant.address)}
          {isCurrentUser && <span className="ml-2 text-xs text-[#4B6B76] font-sans">(you)</span>}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {participant.paid ? (
          <>
            <Check size={14} className="text-green-400" aria-hidden="true" />
            <span className="text-xs text-green-400">Paid</span>
          </>
        ) : (
          <>
            <XIcon size={14} className="text-[#A1A1AA]" aria-hidden="true" />
            <span className="text-xs text-[#A1A1AA]">Pending</span>
          </>
        )}
      </div>
    </div>
  );
}

function RoundHistoryTable({ rows }: { rows: RoundHistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="text-[#A1A1AA] text-sm">No completed rounds yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[#ffffff0a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ffffff0a]">
            <th className="text-left text-xs text-[#A1A1AA] font-medium px-4 py-3">Round</th>
            <th className="text-left text-xs text-[#A1A1AA] font-medium px-4 py-3">Recipient</th>
            <th className="text-left text-xs text-[#A1A1AA] font-medium px-4 py-3">Payout</th>
            <th className="text-left text-xs text-[#A1A1AA] font-medium px-4 py-3">Completed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.round} className="border-b border-[#ffffff05] last:border-0">
              <td className="px-4 py-3 text-white font-medium">#{row.round}</td>
              <td className="px-4 py-3 font-mono text-[#EBEBEB]">{fmt(row.recipient)}</td>
              <td className="px-4 py-3 text-white">{row.amount}</td>
              <td className="px-4 py-3 text-[#A1A1AA]">{row.completedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const circle = CIRCLES[id];

  if (!circle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <p className="text-[#A1A1AA]">Circle not found.</p>
        <Link href="/dashboard/circles" className="text-[#4B6B76] hover:underline text-sm">
          Back to Circles
        </Link>
      </div>
    );
  }

  const currentUserParticipant = circle.participants.find((p) => p.address === CURRENT_WALLET);
  const currentUserPaid = currentUserParticipant?.paid ?? false;
  const isNextRecipient = circle.nextPayoutRecipient === CURRENT_WALLET;

  return (
    <div className="space-y-10 pb-20 md:pb-0">
      {/* Back + Title */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/circles"
          className="text-[#9A9A9A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Back to Circles"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold font-sora text-white">{circle.name}</h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[circle.status]}`}>
          {circle.status}
        </span>
        <div className="h-px bg-[#ffffff1a] flex-1 hidden sm:block" aria-hidden="true" />
        {circle.isOrganizer && <InviteLinkButton circleId={circle.id} />}
      </div>

      {/* Circle Info */}
      <div className="bg-[#212124] p-6 md:p-8 rounded-3xl space-y-6">
        <div>
          <p className="text-xs text-[#A1A1AA] mb-0.5">Creator</p>
          <p className="font-mono text-sm text-[#EBEBEB]">{fmt(circle.creator)}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[#A1A1AA] text-xs mb-2">Members</p>
            <p className="text-lg font-semibold text-white">{circle.participants.length}/{circle.totalSlots}</p>
          </div>
          <div>
            <p className="text-[#A1A1AA] text-xs mb-2">Contribution</p>
            <p className="text-lg font-semibold text-white">{circle.contribution}</p>
          </div>
          <div>
            <p className="text-[#A1A1AA] text-xs mb-2">Duration</p>
            <p className="text-lg font-semibold text-white">{circle.duration}</p>
          </div>
          <div>
            <p className="text-[#A1A1AA] text-xs mb-2">Round</p>
            <p className="text-lg font-semibold text-white">{circle.currentRound} / {circle.totalRounds}</p>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA]">Created {circle.createdAt}</p>
      </div>

      {/* Upcoming payout */}
      <div className="bg-[#212124] p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-sora text-white">Upcoming Payout</h2>
          <CountdownTimer deadline={circle.nextPayoutDeadline} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A1A1AA] mb-1">Next Recipient</p>
            <p className="font-mono text-sm text-[#EBEBEB]">
              {fmt(circle.nextPayoutRecipient)}
              {isNextRecipient && <span className="ml-2 text-xs text-[#4B6B76] font-sans">(you)</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#A1A1AA] mb-1">Amount</p>
            <p className="text-white font-semibold">
              {Number(circle.contribution.replace(/[^\d.]/g, "")) * circle.participants.length} USDT
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {circle.isMember && (
        <div className="flex gap-3 flex-wrap">
          <button
            disabled={currentUserPaid}
            className="px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            {currentUserPaid ? "Contribution Made" : `Make Contribution (${circle.contribution})`}
          </button>
          <button
            disabled={!isNextRecipient}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
              isNextRecipient
                ? "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                : "bg-[#ffffff0a] text-[#A1A1AA] cursor-not-allowed opacity-50"
            }`}
          >
            Claim Reward
          </button>
        </div>
      )}

      {/* Participants */}
      <div>
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold font-sora text-white shrink-0">Participants</h2>
          <div className="ml-4 h-px bg-[#ffffff1a] w-full" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          {circle.participants.map((p) => (
            <ParticipantRow key={p.address} participant={p} />
          ))}
          {circle.participants.length < circle.totalSlots && (
            <div className="flex items-center gap-3 bg-[#ffffff05] border border-dashed border-[#ffffff1a] px-5 py-3 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-[#ffffff0a] flex items-center justify-center text-xs text-[#555]">
                +
              </div>
              <span className="text-xs text-[#555]">
                {circle.totalSlots - circle.participants.length} open slot{circle.totalSlots - circle.participants.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Round History */}
      <div>
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold font-sora text-white shrink-0">Round History</h2>
          <div className="ml-4 h-px bg-[#ffffff1a] w-full" aria-hidden="true" />
        </div>
        <RoundHistoryTable rows={circle.roundHistory} />
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-bold font-sora text-white shrink-0">Activity</h2>
          <div className="ml-4 h-px bg-[#ffffff1a] w-full" aria-hidden="true" />
        </div>
        <ActivityFeed events={MOCK_EVENTS} pageSize={5} />
      </div>
    </div>
  );
}
