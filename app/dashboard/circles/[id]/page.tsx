"use client";

import { use, useState } from "react";
import { ArrowLeft, Check, X as XIcon, Link as LinkIcon, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import ActivityFeed from "@/components/circles/ActivityFeed";
import CountdownTimer from "@/components/ui/CountdownTimer";
import DisputeList from "@/components/circles/DisputeList";
import ReportIssueModal, {
  type ReportIssueSubmission,
} from "@/components/modals/ReportIssueModal";
import ExportButton from "@/components/ui/ExportButton";
import { useToast } from "@/components/ui/Toast";
import type { CircleEvent } from "@/types/circle";
import type { Dispute } from "@/types/dispute";
import type { ExportRow } from "@/lib/export";

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

// Mock disputes keyed by circle id; replace with a disputes API fetch.
const MOCK_DISPUTES: Dispute[] = [
  {
    id: "d1",
    circleId: "1",
    round: 1,
    reporter: CURRENT_WALLET,
    subject: "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
    reason: "missed_payment",
    note: "Slot 3 didn't contribute before the round closed.",
    status: "under_review",
    createdAt: new Date(now - 26 * 60 * 60 * 1000),
  },
  {
    id: "d2",
    circleId: "1",
    round: 1,
    reporter: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    reason: "wrong_amount",
    note: "Payout was 10 USDT short of the expected total.",
    status: "resolved",
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
    resolutionNote: "Shortfall was a gas rounding error; difference re-sent.",
    resolvedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "d3",
    circleId: "3",
    round: 1,
    reporter: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
    reason: "other",
    note: "Requesting a schedule change for the next round.",
    status: "open",
    createdAt: new Date(now - 5 * 60 * 60 * 1000),
  },
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
  active: "bg-green-500/10 text-green-600 dark:text-green-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-[var(--ov-0a)] text-[var(--muted)]",
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
      className="flex items-center gap-2 px-4 py-2 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-600 dark:text-green-400" aria-hidden="true" />
          <span className="text-green-600 dark:text-green-400">Copied!</span>
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
    <div className="flex items-center justify-between bg-[var(--content)] px-5 py-3 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[var(--ov-0a)] flex items-center justify-center text-xs font-bold text-[var(--muted)]">
          {participant.slot}
        </div>
        <span className="font-mono text-sm text-[var(--text)]">
          {fmt(participant.address)}
          {isCurrentUser && <span className="ml-2 text-xs text-[#4B6B76] font-sans">(you)</span>}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {participant.paid ? (
          <>
            <Check size={14} className="text-green-600 dark:text-green-400" aria-hidden="true" />
            <span className="text-xs text-green-600 dark:text-green-400">Paid</span>
          </>
        ) : (
          <>
            <XIcon size={14} className="text-[var(--muted)]" aria-hidden="true" />
            <span className="text-xs text-[var(--muted)]">Pending</span>
          </>
        )}
      </div>
    </div>
  );
}

function RoundHistoryTable({ rows }: { rows: RoundHistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="text-[var(--muted)] text-sm">No completed rounds yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ov-0a)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--ov-0a)]">
            <th className="text-left text-xs text-[var(--muted)] font-medium px-4 py-3">Round</th>
            <th className="text-left text-xs text-[var(--muted)] font-medium px-4 py-3">Recipient</th>
            <th className="text-left text-xs text-[var(--muted)] font-medium px-4 py-3">Payout</th>
            <th className="text-left text-xs text-[var(--muted)] font-medium px-4 py-3">Completed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.round} className="border-b border-[var(--ov-05)] last:border-0">
              <td className="px-4 py-3 text-[var(--text)] font-medium">#{row.round}</td>
              <td className="px-4 py-3 font-mono text-[var(--text)]">{fmt(row.recipient)}</td>
              <td className="px-4 py-3 text-[var(--text)]">{row.amount}</td>
              <td className="px-4 py-3 text-[var(--muted)]">{row.completedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useCallback } from "react";
import { Flag } from "lucide-react";

export default function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const circle = CIRCLES[id];
  const { showToast } = useToast();

  const [disputes, setDisputes] = useState<Dispute[]>(() =>
    MOCK_DISPUTES.filter((d) => d.circleId === id)
  );
  const [reportOpen, setReportOpen] = useState(false);

  const handleSubmitReport = useCallback(
    async ({ round, reason, note }: ReportIssueSubmission) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setDisputes((current) => [
        {
          id: `d-${Date.now()}`,
          circleId: id,
          round,
          reporter: CURRENT_WALLET,
          reason,
          note: note || undefined,
          status: "open",
          createdAt: new Date(),
        },
        ...current,
      ]);
      showToast({
        title: "Issue reported",
        message: "The organizer has been notified and will review it.",
        variant: "success",
      });
    },
    [id, showToast]
  );

  const handleResolveDispute = useCallback(
    async (disputeId: string, resolutionNote: string) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setDisputes((current) =>
        current.map((d) =>
          d.id === disputeId
            ? {
                ...d,
                status: "resolved",
                resolutionNote,
                resolvedAt: new Date(),
              }
            : d
        )
      );
      showToast({ title: "Dispute marked as resolved", variant: "success" });
    },
    [showToast]
  );

  const getExportRows = useCallback((): ExportRow[] => {
    if (!circle) return [];
    const contributions: ExportRow[] = circle.participants
      .filter((p) => p.paid)
      .map((p) => ({
        date: circle.createdAt,
        circleName: circle.name,
        round: circle.currentRound,
        amount: circle.contribution,
        type: "Contribution",
        transactionHash: `0x${p.address.slice(2, 10)}${circle.id}${p.slot}`,
      }));

    const payouts: ExportRow[] = circle.roundHistory.map((row) => ({
      date: row.completedAt,
      circleName: circle.name,
      round: row.round,
      amount: row.amount,
      type: "Payout",
      transactionHash: `0x${row.recipient.slice(2, 10)}${circle.id}r${row.round}`,
    }));

    return [...contributions, ...payouts];
  }, [circle]);

  if (!circle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <p className="text-[var(--muted)]">Circle not found.</p>
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
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Back to Circles"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold font-sora text-[var(--text)]">{circle.name}</h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[circle.status]}`}>
          {circle.status}
        </span>
        <div className="h-px bg-[var(--ov-1a)] flex-1 hidden sm:block" aria-hidden="true" />
        {circle.isOrganizer && (
          <>
            <InviteLinkButton circleId={circle.id} />
            <Link
              href={`/dashboard/circles/${circle.id}/analytics`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              <BarChart3 size={14} aria-hidden="true" />
              Analytics
            </Link>
            <Link
              href={`/dashboard/circles/${circle.id}/settings`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              <Settings size={14} aria-hidden="true" />
              Settings
            </Link>
          </>
        )}
      </div>

      {/* Circle Info */}
      <div className="bg-[var(--content)] p-6 md:p-8 rounded-3xl space-y-6">
        <div>
          <p className="text-xs text-[var(--muted)] mb-0.5">Creator</p>
          <p className="font-mono text-sm text-[var(--text)]">{fmt(circle.creator)}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[var(--muted)] text-xs mb-2">Members</p>
            <p className="text-lg font-semibold text-[var(--text)]">{circle.participants.length}/{circle.totalSlots}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-2">Contribution</p>
            <p className="text-lg font-semibold text-[var(--text)]">{circle.contribution}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-2">Duration</p>
            <p className="text-lg font-semibold text-[var(--text)]">{circle.duration}</p>
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs mb-2">Round</p>
            <p className="text-lg font-semibold text-[var(--text)]">{circle.currentRound} / {circle.totalRounds}</p>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)]">Created {circle.createdAt}</p>
      </div>

      {/* Upcoming payout */}
      <div className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-sora text-[var(--text)]">Upcoming Payout</h2>
          <CountdownTimer deadline={circle.nextPayoutDeadline} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--muted)] mb-1">Next Recipient</p>
            <p className="font-mono text-sm text-[var(--text)]">
              {fmt(circle.nextPayoutRecipient)}
              {isNextRecipient && <span className="ml-2 text-xs text-[#4B6B76] font-sans">(you)</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--muted)] mb-1">Amount</p>
            <p className="text-[var(--text)] font-semibold">
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
                ? "bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400"
                : "bg-[var(--ov-0a)] text-[var(--muted)] cursor-not-allowed opacity-50"
            }`}
          >
            Claim Reward
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#FF5B5B33] bg-[#FF5B5B12] hover:bg-[#FF5B5B22] text-[#FF5B5B] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B5B]"
          >
            <Flag size={15} aria-hidden="true" />
            Report an Issue
          </button>
        </div>
      )}

      {/* Participants */}
      <div>
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold font-sora text-[var(--text)] shrink-0">Participants</h2>
          <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          {circle.participants.map((p) => (
            <ParticipantRow key={p.address} participant={p} />
          ))}
          {circle.participants.length < circle.totalSlots && (
            <div className="flex items-center gap-3 bg-[var(--ov-05)] border border-dashed border-[var(--ov-1a)] px-5 py-3 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-[var(--ov-0a)] flex items-center justify-center text-xs text-[var(--faint)]">
                +
              </div>
              <span className="text-xs text-[var(--faint)]">
                {circle.totalSlots - circle.participants.length} open slot{circle.totalSlots - circle.participants.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Round History */}
      <div>
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold font-sora text-[var(--text)] shrink-0">Round History</h2>
          <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
        </div>
        <RoundHistoryTable rows={circle.roundHistory} />
      </div>

      {/* Disputes */}
      <div>
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold font-sora text-white shrink-0">
            {circle.isOrganizer ? "Disputes" : "Your Reports"}
          </h2>
          {circle.isOrganizer && disputes.length > 0 && (
            <span className="ml-3 shrink-0 rounded-full bg-[#ffffff0a] px-2.5 py-1 text-xs text-[#A1A1AA]">
              {disputes.filter((d) => d.status !== "resolved").length} unresolved
            </span>
          )}
          <div className="ml-4 h-px bg-[#ffffff1a] w-full" aria-hidden="true" />
        </div>
        <DisputeList
          disputes={disputes}
          isOrganizer={circle.isOrganizer}
          currentAddress={CURRENT_WALLET}
          onResolve={handleResolveDispute}
        />
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-bold font-sora text-[var(--text)] shrink-0">Activity</h2>
          <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
        </div>
        <ActivityFeed events={MOCK_EVENTS} pageSize={5} />
      </div>

      <ReportIssueModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        circleName={circle.name}
        round={circle.currentRound}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}
