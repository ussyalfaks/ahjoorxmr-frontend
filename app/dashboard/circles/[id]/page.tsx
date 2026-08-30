"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X as XIcon, Link as LinkIcon, Settings, BarChart3, LogOut } from "lucide-react";
import Link from "next/link";
import LeaveCircleModal from "@/components/modals/LeaveCircleModal";
import { addNotification } from "@/lib/notifications";
import { ANNOUNCEMENTS_EVENT, getAnnouncementsForCircle } from "@/lib/announcements";
import ActivityFeed from "@/components/circles/ActivityFeed";
import CountdownTimer from "@/components/ui/CountdownTimer";
import DisputeList from "@/components/circles/DisputeList";
import DiscussionThread from "@/components/circles/DiscussionThread";
import CommentComposer from "@/components/circles/CommentComposer";
import ReportIssueModal, {
  type ReportIssueSubmission,
} from "@/components/modals/ReportIssueModal";
import ExportButton from "@/components/ui/ExportButton";
import { useToast } from "@/components/ui/Toast";
import type { CircleEvent, PenaltyConfig } from "@/types/circle";
import type { Dispute } from "@/types/dispute";
import type { Comment } from "@/types/discussion";
import type { ExportRow } from "@/lib/export";
import CircleHealthIndicator from "@/components/circles/CircleHealthIndicator";
import BookmarkButton from "@/components/circles/BookmarkButton";
import { getMockCircleHealth } from "@/lib/circleHealth";
import { getPayoutDraw, type PayoutDraw } from "@/lib/payoutDraw";
import { Lock } from "lucide-react";
import AutoPaySection from "@/components/circles/AutoPaySection";
import { enableAutoPay, getAutoPayConfig, recordAutoPayAttempt } from "@/lib/autoPay";

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

const now = Date.now();

interface Participant {
  address: string;
  slot: number;
  paid: boolean;
  role: "organizer" | "co-organizer" | "participant";
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
  isCoOrganizer: boolean;
  isMember: boolean;
  penalty?: PenaltyConfig;
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

// Mock comments keyed by circle id; replace with a fetch / real-time
// subscription (e.g. socket.on("comment")) without touching the components.
const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    circleId: "1",
    author: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    displayName: "Emeka",
    body: "Hey everyone! Just a reminder that round 2 contributions are due by end of week.",
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "c2",
    circleId: "1",
    author: CURRENT_WALLET,
    body: "Thanks for the heads up! I already made my contribution earlier today.",
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "c3",
    circleId: "1",
    author: "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
    body: "Will the payout go out on Friday or Saturday this round?",
    createdAt: new Date(now - 6 * 60 * 60 * 1000),
  },
  {
    id: "c4",
    circleId: "3",
    author: CURRENT_WALLET,
    body: "Welcome everyone to the Community Fund circle! Feel free to use this thread for updates and questions.",
    createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
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
      { address: CURRENT_WALLET, slot: 1, paid: true, role: "co-organizer" },
      { address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", slot: 2, paid: true, role: "organizer" },
      { address: "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8", slot: 3, paid: false, role: "participant" },
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
    isCoOrganizer: true,
    isMember: true,
  },
  "2": {
    id: "2",
    name: "School fees",
    creator: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1",
    status: "active",
    createdAt: "Feb 3, 2025",
    participants: [
      { address: CURRENT_WALLET, slot: 1, paid: false, role: "participant" },
      { address: "0x222def3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9", slot: 2, paid: true, role: "organizer" },
      { address: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", slot: 3, paid: true, role: "participant" },
      { address: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", slot: 4, paid: false, role: "participant" },
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
    isCoOrganizer: false,
    isMember: true,
    penalty: { enabled: true, type: "percentage", value: "10" },
  },
  "6": {
    id: "6",
    name: "Winter Giving Circle",
    creator: "0xarchive8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
    status: "completed",
    createdAt: "May 20, 2025",
    participants: [
      { address: CURRENT_WALLET, slot: 1, paid: true, role: "participant" },
      { address: "0x888archive2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8", slot: 2, paid: true, role: "organizer" },
      { address: "0x999archive3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9", slot: 3, paid: true, role: "participant" },
    ],
    totalSlots: 3,
    contribution: "100 USDT",
    duration: "14 Days",
    roundHistory: [
      { round: 1, recipient: CURRENT_WALLET, amount: "300 USDT", completedAt: "Jun 3, 2025" },
      { round: 2, recipient: "0x888archive2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8", amount: "300 USDT", completedAt: "Jun 17, 2025" },
      { round: 3, recipient: "0x999archive3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9", amount: "300 USDT", completedAt: "Jul 1, 2025" },
    ],
    currentRound: 3,
    totalRounds: 3,
    nextPayoutRecipient: CURRENT_WALLET,
    nextPayoutDeadline: null,
    isOrganizer: false,
    isCoOrganizer: false,
    isMember: true,
  },
  "3": {
    id: "3",
    name: "Community Fund",
    creator: CURRENT_WALLET,
    status: "active",
    createdAt: "Mar 1, 2025",
    participants: [
      { address: CURRENT_WALLET, slot: 1, paid: true, role: "organizer" },
      { address: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", slot: 2, paid: true, role: "participant" },
      { address: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", slot: 3, paid: false, role: "participant" },
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
    isCoOrganizer: false,
    isMember: true,
  },
};

const STATUS_STYLES: Record<CircleDetail["status"], string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-[var(--ov-0a)] text-[var(--muted)]",
};

type TabId = "overview" | "discussion";

const TAB_LIST: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "discussion", label: "Discussion" },
];

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
        <Link href={`/dashboard/profile/${encodeURIComponent(participant.address)}`} className="font-mono text-sm text-[var(--text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]">
          {fmt(participant.address)}
          {isCurrentUser && <span className="ml-2 text-xs text-[#4B6B76] font-sans">(you)</span>}
        </Link>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          participant.role === "organizer"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
            : participant.role === "co-organizer"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-[var(--muted)]"
        }`}>
          {participant.role === "organizer" ? "Organizer" : participant.role === "co-organizer" ? "Co-Organizer" : "Participant"}
        </span>
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
import ShareMilestoneButton from "@/components/ui/ShareMilestoneButton";
import type { MilestoneData } from "@/types/milestone";

export default function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const circle = CIRCLES[id];
  const { showToast } = useToast();
  const router = useRouter();

  const [disputes, setDisputes] = useState<Dispute[]>(() =>
    MOCK_DISPUTES.filter((d) => d.circleId === id)
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [comments, setComments] = useState<Comment[]>(() =>
    MOCK_COMMENTS.filter((c) => c.circleId === id)
  );
  const [payoutDraw, setPayoutDraw] = useState<PayoutDraw | null>(null);
  const [announcementEvents, setAnnouncementEvents] = useState<CircleEvent[]>([]);

  useEffect(() => {
    setPayoutDraw(getPayoutDraw(id));
  }, [id]);

  useEffect(() => {
    const sync = () => {
      setAnnouncementEvents(
        getAnnouncementsForCircle(id).map((a) => ({
          id: a.id,
          type: "announcement_sent",
          actor: a.sentBy,
          timestamp: new Date(a.sentAt),
          meta: { message: a.message, priority: a.priority },
        }))
      );
    };
    sync();
    window.addEventListener(ANNOUNCEMENTS_EVENT, sync);
    return () => window.removeEventListener(ANNOUNCEMENTS_EVENT, sync);
  }, [id]);

  useEffect(() => {
    // Demo seed: circle "2" starts with auto-pay already on but its latest
    // attempt failed, to demonstrate the manual-contribution fallback below.
    // Replace with real attempt events once auto-pay has a backend to report them.
    if (id === "2" && !getAutoPayConfig(id)) {
      enableAutoPay({ circleId: id, authorizedAmount: "40 USDT", frequency: "Every round (every 12 Days)" });
      recordAutoPayAttempt(id, {
        status: "failed",
        date: new Date().toISOString(),
        reason: "Wallet balance was insufficient to cover this round's contribution.",
      });
    }
  }, [id]);

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

  const handlePostComment = useCallback(
    async (body: string) => {
      // Simulate network latency; swap for a real POST/mutation here.
      await new Promise((resolve) => setTimeout(resolve, 300));
      setComments((current) => [
        ...current,
        {
          id: `comment-${Date.now()}`,
          circleId: id,
          author: CURRENT_WALLET,
          body,
          createdAt: new Date(),
        },
      ]);
    },
    [id]
  );

  const handleLeaveCircle = useCallback(async () => {
    if (!circle) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
    addNotification({
      id: `member-left-${circle.id}-${Date.now()}`,
      type: "member_left",
      title: "A member left your circle",
      description: `${fmt(CURRENT_WALLET)} left ${circle.name}.`,
      href: `/dashboard/circles/${circle.id}`,
    });
    setLeaveOpen(false);
    showToast({ title: `You left ${circle.name}`, variant: "success" });
    router.push("/dashboard/circles");
  }, [circle, router, showToast]);

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
  const canManageCircle = circle.isOrganizer || circle.isCoOrganizer;

  // Leave-circle eligibility — non-organizer participants only, and never on
  // a circle that's already finished.
  const canLeaveCircle = circle.isMember && !circle.isOrganizer && circle.status !== "completed";
  const hasCircleStarted = circle.roundHistory.length > 0 || circle.currentRound > 1;
  // A locked payout order assumes a fixed member list for every round still
  // ahead of it — leaving before your own payout turn would skip whoever
  // was scheduled behind you, so that case is blocked rather than allowed.
  const userAlreadyReceivedPayout = payoutDraw
    ? payoutDraw.order.slice(0, circle.currentRound - 1).includes(CURRENT_WALLET)
    : false;
  const leavingBreaksPayoutOrder = !!payoutDraw && hasCircleStarted && !userAlreadyReceivedPayout;

  // Build milestone data for completed circles or when user is the next recipient
  const completedMilestone: MilestoneData | null =
    circle.status === "completed"
      ? {
          type: "circle_completed",
          circleName: circle.name,
          amount: `${Number(circle.contribution.replace(/[^\d.]/g, "")) * circle.participants.length} USDT`,
          subtitle: `${circle.totalRounds} rounds completed · ${circle.participants.length} members`,
          date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        }
      : null;

  const payoutMilestone: MilestoneData | null =
    isNextRecipient
      ? {
          type: "payout_received",
          circleName: circle.name,
          amount: `${Number(circle.contribution.replace(/[^\d.]/g, "")) * circle.participants.length} USDT`,
          subtitle: `Round ${circle.currentRound} of ${circle.totalRounds}`,
          date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        }
      : null;

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
        <BookmarkButton circleId={circle.id} circleName={circle.name} size={18} />
        <CircleHealthIndicator health={getMockCircleHealth(circle.id)} />
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[circle.status]}`}>
          {circle.status}
        </span>
        <div className="h-px bg-[var(--ov-1a)] flex-1 hidden sm:block" aria-hidden="true" />
        {canManageCircle && (
          <>
            <InviteLinkButton circleId={circle.id} />
            {circle.isOrganizer && (
              <Link
                href={`/dashboard/circles/${circle.id}/analytics`}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                <BarChart3 size={14} aria-hidden="true" />
                Analytics
              </Link>
            )}
            <Link
              href={`/dashboard/circles/${circle.id}/settings`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              <Settings size={14} aria-hidden="true" />
              Settings
            </Link>
          </>
        )}
        {/* Share button — visible whenever there is a shareable milestone */}
        {(completedMilestone ?? payoutMilestone) && (
          <ShareMilestoneButton
            milestone={(completedMilestone ?? payoutMilestone)!}
            variant="default"
          />
        )}
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Circle sections"
        className="flex gap-1 border-b border-[var(--ov-0f)]"
      >
        {TAB_LIST.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                isActive
                  ? "text-[var(--text)] border-b-2 border-[#4B6B76] -mb-px"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
              {tab.id === "discussion" && comments.length > 0 && (
                <span className="ml-2 rounded-full bg-[var(--ov-0a)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                  {comments.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Overview tab ── */}
      <div
        role="tabpanel"
        id="tabpanel-overview"
        aria-labelledby="tab-overview"
        hidden={activeTab !== "overview"}
        className={activeTab === "overview" ? "space-y-10" : ""}
      >
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
        {circle.status !== "completed" && <div className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
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
        </div>}

        {/* Auto-Pay */}
        {circle.isMember && circle.status !== "completed" && (
          <AutoPaySection circleId={circle.id} defaultAmount={circle.contribution} roundDuration={circle.duration} />
        )}

        {/* Action buttons */}
        {circle.isMember && circle.status !== "completed" && (
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
            {canLeaveCircle && (
              <button
                onClick={() => setLeaveOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--muted)] hover:text-[var(--text)] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                <LogOut size={15} aria-hidden="true" />
                Leave Circle
              </button>
            )}
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

        {/* Payout Order (fair draw result) */}
        {payoutDraw && (
          <div>
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-bold font-sora text-[var(--text)] shrink-0">Payout Order</h2>
              <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-[var(--ov-0a)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                <Lock size={10} aria-hidden="true" />
                Locked
              </span>
              <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
            </div>
            <ol className="space-y-1.5">
              {payoutDraw.order.map((address, i) => (
                <li
                  key={address}
                  className="flex items-center justify-between bg-[var(--content)] px-5 py-3 rounded-xl text-sm"
                >
                  <span className="text-[var(--faint)] text-xs">Round {i + 1}</span>
                  <span className="font-mono text-[var(--text)]">
                    {fmt(address)}
                    {address === CURRENT_WALLET && <span className="ml-2 text-xs text-[#4B6B76] font-sans">(you)</span>}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[10px] text-[var(--faint)] font-mono">
              Seed {payoutDraw.seed} · drawn {new Date(payoutDraw.timestamp).toLocaleString()}
            </p>
          </div>
        )}

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
          <ActivityFeed events={[...MOCK_EVENTS, ...announcementEvents]} pageSize={5} />
        </div>

        <ExportButton
          getRows={getExportRows}
          scope={circle.name}
          prefix="circle"
          title={`${circle.name} — Transaction History`}
        />
      </div>

      {/* ── Discussion tab ── */}
      <div
        role="tabpanel"
        id="tabpanel-discussion"
        aria-labelledby="tab-discussion"
        hidden={activeTab !== "discussion"}
        className={activeTab === "discussion" ? "space-y-6" : ""}
      >
        <DiscussionThread comments={comments} currentAddress={CURRENT_WALLET} />
        <CommentComposer
          onSubmit={handlePostComment}
          disabled={!circle.isMember}
        />
      </div>

      <ReportIssueModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        circleName={circle.name}
        round={circle.currentRound}
        onSubmit={handleSubmitReport}
      />

      <LeaveCircleModal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        circleName={circle.name}
        contribution={circle.contribution}
        hasStarted={hasCircleStarted}
        penalty={circle.penalty}
        blocked={leavingBreaksPayoutOrder}
        blockedReason="Leaving now would break this round's payout order — a member is still waiting on the fixed schedule from your circle's payout draw. Ask the organizer to re-run the draw before you leave."
        onConfirm={handleLeaveCircle}
      />
    </div>
  );
}
