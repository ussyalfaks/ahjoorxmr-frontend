"use client";

import { use, useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X as XIcon, Settings, BarChart3, LogOut, ChevronDown, Flag, Lock } from "lucide-react";
import Link from "next/link";
import LeaveCircleModal from "@/components/modals/LeaveCircleModal";
import { addNotification } from "@/lib/notifications";
import { ANNOUNCEMENTS_EVENT, getAnnouncementsForCircle } from "@/lib/announcements";
import ActivityFeed from "@/components/circles/ActivityFeed";
import InviteManager from "@/components/circles/InviteManager";
import { getInviteUsage, INVITES_UPDATED_EVENT } from "@/lib/inviteLinks";
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
import { type Comment, MAX_PINNED_COMMENTS } from "@/types/discussion";
import type { ExportColumn, ExportRecord, ExportRow } from "@/lib/export";
import CircleHealthIndicator from "@/components/circles/CircleHealthIndicator";
import BookmarkButton from "@/components/circles/BookmarkButton";
import { getMockCircleHealth } from "@/lib/circleHealth";
import { getPayoutDraw, type PayoutDraw } from "@/lib/payoutDraw";
import AutoPaySection from "@/components/circles/AutoPaySection";
import { enableAutoPay, getAutoPayConfig, recordAutoPayAttempt } from "@/lib/autoPay";
import { useCircleModeration } from "@/hooks/useCircleModeration";
import CircleRulesView from "@/components/circles/CircleRulesView";
import { CIRCLE_RULES_UPDATED_EVENT, getCircleRules, rulesMarkdownToList, type CircleRulesRecord } from "@/lib/circleRules";
import { getCircleFaq, CIRCLE_FAQ_UPDATED_EVENT, type FaqItem } from "@/lib/circleFaq";
import CircleImage from "@/components/circles/CircleImage";
import { DownloadAgreementButton } from "@/components/circles/DownloadAgreementButton";
import type { ModerationEvent } from "@/types/discussion";
import WaitlistPositionCard from "@/components/circles/WaitlistPositionCard";
import PayoutScheduleTimeline, { type PayoutRound } from "@/components/circles/PayoutScheduleTimeline";
import PayoutMethodSelector from "@/components/circles/PayoutMethodSelector";
import PayoutMethodBadge from "@/components/circles/PayoutMethodBadge";
import { getCircleCurrency, isPayoutInProgress } from "@/lib/payoutMethods";
import CirclePolls from "@/components/circles/CirclePolls";
import ShareMilestoneButton from "@/components/ui/ShareMilestoneButton";
import type { MilestoneData } from "@/types/milestone";
import { useCirclePause } from "@/hooks/useCirclePause";
import { useTimezone } from "@/hooks/useTimezone";
import { generateCalendarIcs, downloadIcsFile } from "@/lib/calendarExport";
import { detectCircleMilestones, celebrateMilestone } from "@/lib/milestoneCelebrations";
import { recordLeftCircle } from "@/lib/circleRecommendations";
import CirclePausedBanner from "@/components/circles/CirclePausedBanner";
import ContactDirectory from "@/components/circles/ContactDirectory";
import CircleAutoRenewCard from "@/components/circles/CircleAutoRenewCard";
import { getStoredCircle } from "@/lib/circleRenewal";
import {
  getContributionCreditLedger,
  getCircleReserveBalance,
  distributeCompletedCircleReserve,
  type ContributionCreditEntry,
} from "@/lib/contributionCreditStore";

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

const now = Date.now();

interface Participant {
  address: string;
  slot: number;
  paid: boolean;
  role: "organizer" | "co-organizer" | "participant";
  totalContributed?: number;
  penaltiesPaid?: number;
}

interface SettlementExportRow extends ExportRecord {
  member: string;
  totalContributed: string;
  payoutReceived: string;
  penalties: string;
  creditOrRefund: string;
}

const SETTLEMENT_COLUMNS: ExportColumn[] = [
  { key: "member", label: "Member" },
  { key: "totalContributed", label: "Total Contributed" },
  { key: "payoutReceived", label: "Payout Received" },
  { key: "penalties", label: "Penalties Paid" },
  { key: "creditOrRefund", label: "Credit / (Refund)" },
];

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

function getSettlementReport(circle: CircleDetail): SettlementReport {
  const { amount: contributionAmount, currency } = parseContribution(circle.contribution);
  const payoutsByAddress = new Map<string, number>();

  for (const round of circle.roundHistory) {
    const payout = parseContribution(round.amount);
    if (payout.currency !== currency) {
      throw new Error(`Payout currency ${payout.currency} does not match ${currency}.`);
    }
    const address = round.recipient.toLowerCase();
    payoutsByAddress.set(address, (payoutsByAddress.get(address) ?? 0) + payout.amount);
  }

  return buildSettlementReport(
    circle.participants.map((participant) => ({
      address: participant.address,
      totalContributed: participant.totalContributed ?? contributionAmount * circle.roundHistory.length,
      payoutReceived: payoutsByAddress.get(participant.address.toLowerCase()) ?? 0,
      penalties: participant.penaltiesPaid ?? 0,
    })),
    currency
  );
}

function formatSettlementAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function formatCreditOrRefund(amount: number, currency: string): string {
  const formatted = formatSettlementAmount(Math.abs(amount), currency);
  if (amount > 0) return `${formatted} credit`;
  if (amount < 0) return `${formatted} refund`;
  return formatted;
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
    isPinned: true,
    pinnedAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
    pinnedBy: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
  },
  {
    id: "c2",
    circleId: "1",
    author: CURRENT_WALLET,
    body: "Thanks for the heads up! I already made my contribution earlier today.",
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
    parentId: "c1",
  },
  {
    id: "c2b",
    circleId: "1",
    author: "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
    body: "Confirmed, mine has been submitted as well.",
    createdAt: new Date(now - 1.5 * 24 * 60 * 60 * 1000),
    parentId: "c1",
  },
  {
    id: "c2c",
    circleId: "1",
    author: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    displayName: "Emeka",
    body: "Thanks for the quick responses everyone! On track for another smooth round.",
    createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
    parentId: "c1",
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
    isPinned: true,
    pinnedAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
    pinnedBy: CURRENT_WALLET,
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
      { address: CURRENT_WALLET, slot: 1, paid: true, role: "participant", totalContributed: 300, penaltiesPaid: 0 },
      { address: "0x888archive2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8", slot: 2, paid: true, role: "organizer", totalContributed: 300, penaltiesPaid: 0 },
      { address: "0x999archive3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9", slot: 3, paid: true, role: "participant", totalContributed: 300, penaltiesPaid: 0 },
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
  active: "bg-[var(--status-paid-bg)] text-[var(--status-paid)]",
  pending: "bg-[var(--status-pending-bg)] text-[var(--status-pending)]",
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
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${participant.role === "organizer"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
            : participant.role === "co-organizer"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-[var(--muted)]"
          }`}>
          {participant.role === "organizer" ? "Organizer" : participant.role === "co-organizer" ? "Co-Organizer" : "Participant"}
        </span>
        {participant.paid ? (
          <>
            <Check size={14} className="text-[var(--status-paid)]" aria-hidden="true" />
            <span className="text-xs text-[var(--status-paid)]">Paid</span>
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
            <th className="text-start text-xs text-[var(--muted)] font-medium px-4 py-3">Round</th>
            <th className="text-start text-xs text-[var(--muted)] font-medium px-4 py-3">Recipient</th>
            <th className="text-start text-xs text-[var(--muted)] font-medium px-4 py-3">Payout</th>
            <th className="text-start text-xs text-[var(--muted)] font-medium px-4 py-3">Completed</th>
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

export default function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const rawCircle = CIRCLES[id] ?? getStoredCircle(id);
  const circle = useMemo(() => {
    if (!rawCircle) return null;
    const currentParticipant = rawCircle.participants.find(
      (participant) => participant.address.toLowerCase() === CURRENT_WALLET.toLowerCase()
    );
    return {
      ...rawCircle,
      isOrganizer: rawCircle.creator.toLowerCase() === CURRENT_WALLET.toLowerCase(),
      isCoOrganizer: currentParticipant?.role === "co-organizer",
      isMember: rawCircle.participants.some(
        (p) => p.address.toLowerCase() === CURRENT_WALLET.toLowerCase()
      ),
    };
  }, [rawCircle]);
  const { showToast } = useToast();
  const router = useRouter();
  const { timezone, formatDateTime } = useTimezone();

  const [disputes, setDisputes] = useState<Dispute[]>(() =>
    MOCK_DISPUTES.filter((d) => d.circleId === id)
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [comments, setComments] = useState<Comment[]>(() =>
    MOCK_COMMENTS.filter((c) => c.circleId === id)
  );
  const [circleEvents, setCircleEvents] = useState<CircleEvent[]>(() => MOCK_EVENTS);
  const [payoutDraw] = useState<PayoutDraw | null>(() => getPayoutDraw(id));
  const [announcementEvents, setAnnouncementEvents] = useState<CircleEvent[]>([]);
  const [inviteEvents, setInviteEvents] = useState<CircleEvent[]>([]);
  const [creditLedger, setCreditLedger] = useState<ContributionCreditEntry[]>([]);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const pauseState = useCirclePause(id);
  const pauseEvents: CircleEvent[] = pauseState.log.map((entry) => ({
    id: entry.id,
    type: entry.type === "paused" ? "circle_paused" : "circle_resumed",
    actor: entry.actor,
    timestamp: new Date(entry.at),
    meta: entry.reason ? { message: entry.reason } : undefined,
  }));

  useEffect(() => {
    const sync = () => setCreditLedger(getContributionCreditLedger());
    sync();
    window.addEventListener(CONTRIBUTION_CREDITS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONTRIBUTION_CREDITS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!circle || circle.status !== "completed") return;
    try {
      const refunds = refundCompletedCircleCredits(circle.id);
      if (refunds.length > 0) {
        setCreditLedger(getContributionCreditLedger());
        showToast({
          title: "Credit refund recorded",
          message: `${refunds.length} member balance${refunds.length === 1 ? "" : "s"} refunded in the demo ledger.`,
          variant: "success",
        });
      }
      // Distribute leftover reserve back to members proportionally
      const reserveDistributions = distributeCompletedCircleReserve(
        circle.id,
        circle.participants.map((p) => p.address)
      );
      if (reserveDistributions.length > 0) {
        setCreditLedger(getContributionCreditLedger());
        showToast({
          title: "Reserve distributed",
          message: `${reserveDistributions.length} member${reserveDistributions.length === 1 ? "" : "s"} received reserve distributions.`,
          variant: "success",
        });
      }
    } catch (error) {
      showToast({
        title: "Could not refund contribution credits",
        message: error instanceof Error ? error.message : "The credit ledger could not be updated.",
        variant: "error",
      });
    }
  }, [circle, showToast]);

  useEffect(() => {
    const sync = () =>
      setInviteEvents(
        getInviteUsage(id).map((u) => ({
          id: u.id,
          type: "invite_used",
          actor: "Invite link",
          timestamp: new Date(u.usedAt),
        }))
      );
    sync();
    window.addEventListener(INVITES_UPDATED_EVENT, sync);
    return () => window.removeEventListener(INVITES_UPDATED_EVENT, sync);
  }, [id]);
  const [circleRules, setCircleRules] = useState<CircleRulesRecord | null>(null);
  const [circleFaq, setCircleFaq] = useState<FaqItem[]>(() => getCircleFaq(id));
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const moderation = useCircleModeration(circle, CURRENT_WALLET);

  // Celebrate milestones this circle has reached (each plays once per user).
  useEffect(() => {
    if (!circle || !circle.isMember) return;
    detectCircleMilestones({
      id: circle.id,
      name: circle.name,
      status: circle.status,
      memberCount: circle.participants.length,
      totalSlots: circle.totalSlots,
      lastCompletedRound: circle.roundHistory.reduce((max, row) => Math.max(max, row.round), 0),
      totalRounds: circle.totalRounds,
    }).forEach(celebrateMilestone);
  }, [circle]);

  useEffect(() => {
    const syncRules = () => setCircleRules(getCircleRules(id));
    syncRules();
    window.addEventListener(CIRCLE_RULES_UPDATED_EVENT, syncRules);
    return () => window.removeEventListener(CIRCLE_RULES_UPDATED_EVENT, syncRules);
  }, [id]);

  useEffect(() => {
    const syncFaq = () => setCircleFaq(getCircleFaq(id));
    syncFaq();
    window.addEventListener(CIRCLE_FAQ_UPDATED_EVENT, syncFaq);
    return () => window.removeEventListener(CIRCLE_FAQ_UPDATED_EVENT, syncFaq);
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

  const handleReplyComment = useCallback(
    async (body: string, parentId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setComments((current) => [
        ...current,
        {
          id: `comment-${Date.now()}`,
          circleId: id,
          author: CURRENT_WALLET,
          body,
          createdAt: new Date(),
          parentId,
        },
      ]);
    },
    [id]
  );

  const handlePinComment = useCallback(
    (commentId: string) => {
      const target = comments.find((c) => c.id === commentId);
      if (!target) return;

      const currentPinned = comments.filter((c) => c.isPinned && !c.isDeleted);
      if (currentPinned.length >= MAX_PINNED_COMMENTS) {
        showToast({
          title: "Pin limit reached",
          message: `You can pin up to ${MAX_PINNED_COMMENTS} messages per circle. Please unpin a message first.`,
          variant: "error",
        });
        return;
      }

      setComments((current) =>
        current.map((c) =>
          c.id === commentId
            ? { ...c, isPinned: true, pinnedAt: new Date(), pinnedBy: CURRENT_WALLET }
            : c
        )
      );

      const pinEvent: CircleEvent = {
        id: `event-pin-${Date.now()}`,
        type: "comment_pinned",
        actor: CURRENT_WALLET,
        timestamp: new Date(),
        meta: { message: target.body, commentId: target.id },
      };
      setCircleEvents((prev) => [pinEvent, ...prev]);

      showToast({
        title: "Message pinned",
        message: "The message is now pinned at the top and logged to activity.",
        variant: "success",
      });
    },
    [comments, showToast]
  );

  const handleUnpinComment = useCallback(
    (commentId: string) => {
      const target = comments.find((c) => c.id === commentId);
      if (!target) return;

      setComments((current) =>
        current.map((c) =>
          c.id === commentId
            ? { ...c, isPinned: false, pinnedAt: undefined, pinnedBy: undefined }
            : c
        )
      );

      const unpinEvent: CircleEvent = {
        id: `event-unpin-${Date.now()}`,
        type: "comment_unpinned",
        actor: CURRENT_WALLET,
        timestamp: new Date(),
        meta: { message: target.body, commentId: target.id },
      };
      setCircleEvents((prev) => [unpinEvent, ...prev]);

      showToast({
        title: "Message unpinned",
        message: "The message was unpinned and logged to activity.",
        variant: "success",
      });
    },
    [comments, showToast]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      setComments((current) => current.filter((c) => c.id !== commentId));
      showToast({
        title: "Comment deleted",
        variant: "success",
      });
    },
    [showToast]
  );
  const handleModerationAction = useCallback((action: ModerationEvent) => {
    const event: CircleEvent = {
      id: `mod-${Date.now()}`,
      type: "announcement_sent",
      actor: action.actorAddress,
      timestamp: new Date(),
      meta: { moderation: action },
    };
    setAnnouncementEvents((prev) => [event, ...prev]);
  }, []);

  const handleLeaveCircle = useCallback(async () => {
    if (!circle) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
    addNotification({
      id: `member-left-${circle.id}-${Date.now()}`,
      type: "member_left",
      title: "A member left your circle",
      description: `${fmt(CURRENT_WALLET)} left ${circle.name}.`,
      href: `/dashboard/circles/${circle.id}`,
      circleId: circle.id,
    });
    recordLeftCircle(circle.id);
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
  const contributionAmount = parseContribution(circle.contribution);
  const currentCreditBalance = getContributionCreditBalance(creditLedger, circle.id, CURRENT_WALLET);
  const currentAmountDue = getContributionAmountDue(
    creditLedger,
    circle.id,
    CURRENT_WALLET,
    contributionAmount.amount
  );
  const currentReserveBalance = getCircleReserveBalance(circle.id);
  const circleReserveConfig = (circle as any).reserveEnabled
    ? {
        enabled: true,
        percentage: (circle as any).reservePercentage || 0,
        balance: currentReserveBalance,
      }
    : null;
  const currentRoundPaymentRecorded = creditLedger.some(
    (entry) =>
      entry.type === "payment" &&
      entry.circleId === circle.id &&
      entry.memberAddress.toLowerCase() === CURRENT_WALLET.toLowerCase() &&
      entry.round === circle.currentRound
  );
  const settlementReport =
    circle.status === "completed" ? getSettlementReport(circle) : null;
  const settlementExportRows: SettlementExportRow[] = settlementReport
    ? [
        ...settlementReport.members.map((member) => ({
          member: member.address,
          totalContributed: formatSettlementAmount(member.totalContributed, settlementReport.currency),
          payoutReceived: formatSettlementAmount(member.payoutReceived, settlementReport.currency),
          penalties: formatSettlementAmount(member.penalties, settlementReport.currency),
          creditOrRefund: formatCreditOrRefund(member.creditOrRefund, settlementReport.currency),
        })),
        {
          member: "TOTAL",
          totalContributed: formatSettlementAmount(settlementReport.totals.totalContributed, settlementReport.currency),
          payoutReceived: formatSettlementAmount(settlementReport.totals.payoutReceived, settlementReport.currency),
          penalties: formatSettlementAmount(settlementReport.totals.penalties, settlementReport.currency),
          creditOrRefund: formatCreditOrRefund(settlementReport.totals.creditOrRefund, settlementReport.currency),
        },
      ]
    : [];
  const currentUserPaid = (currentUserParticipant?.paid ?? false) || currentRoundPaymentRecorded;
  const isNextRecipient = circle.nextPayoutRecipient === CURRENT_WALLET;
  const canManageCircle = circle.isOrganizer || circle.isCoOrganizer;
  const health = getMockCircleHealth(circle.id);
  const circleCurrency = getCircleCurrency(circle.contribution);
  const payoutInProgress = isPayoutInProgress(isNextRecipient, circle.nextPayoutDeadline);
  const visibleCreditParticipants = circle.participants.filter(
    (participant) =>
      canManageCircle || participant.address.toLowerCase() === CURRENT_WALLET.toLowerCase()
  );
  const visibleCreditRows = visibleCreditParticipants.map((participant) => ({
    address: participant.address,
    balance: getContributionCreditBalance(creditLedger, circle.id, participant.address),
    refunded: creditLedger
      .filter(
        (entry) =>
          entry.circleId === circle.id &&
          entry.memberAddress.toLowerCase() === participant.address.toLowerCase() &&
          entry.type === "refund"
      )
      .reduce((sum, entry) => sum + entry.amount, 0),
  }));
  const appliedThisRound = creditLedger
    .filter(
      (entry) =>
        entry.circleId === circle.id &&
        entry.memberAddress.toLowerCase() === CURRENT_WALLET.toLowerCase() &&
        entry.type === "applied" &&
        entry.round === circle.currentRound
    )
    .reduce((sum, entry) => sum + entry.amount, 0);

  function handleRecordContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const paidAmount = Number(paymentAmount);
    if (!Number.isFinite(paidAmount) || paidAmount < 0) return;
    try {
      const reservePercentage = circleReserveConfig?.percentage || 0;
      const result = recordContributionPayment({
        circleId: circle.id,
        memberAddress: CURRENT_WALLET,
        round: circle.currentRound,
        requiredAmount: contributionAmount.amount,
        paidAmount,
        reservePercentage,
        reserveBalance: currentReserveBalance,
      });
      setCreditLedger(result.entries);
      setShowContributionForm(false);
      setPaymentAmount("");
      const messages = [
        result.creditApplied > 0
          ? `${formatSettlementAmount(result.creditApplied, contributionAmount.currency)} credit applied.`
          : "",
        result.overpayment > 0
          ? `${formatSettlementAmount(result.overpayment, contributionAmount.currency)} added as credit.`
          : "",
        result.reserveContributed > 0
          ? `${formatSettlementAmount(result.reserveContributed, contributionAmount.currency)} added to reserve.`
          : "",
      ].filter(Boolean);
      showToast({
        title: "Demo contribution recorded",
        message: messages.join(" ") || "No overpayment credit was added.",
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: "Could not record contribution",
        message: error instanceof Error ? error.message : "The contribution credit ledger could not be updated.",
        variant: "error",
      });
    }
  }

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
      <CircleImage circleId={circle.id} circleName={circle.name} kind="cover" alt={`${circle.name} cover`} className="aspect-[16/5] w-full rounded-2xl object-cover" />
      <CirclePausedBanner circleId={circle.id} />
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
        {pauseState.paused ? (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Paused
          </span>
        ) : (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[circle.status]}`}>
            {circle.status}
          </span>
        )}
        <div className="h-px bg-[var(--ov-1a)] flex-1 hidden sm:block" aria-hidden="true" />
        {canManageCircle && (
          <>
            <InviteManager circleId={circle.id} />
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
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${isActive
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
        {/* Auto-Renew & Next Cycle */}
        <CircleAutoRenewCard
          circle={circle}
          currentWallet={CURRENT_WALLET}
          onCycleCreated={(newCircleId) => router.push(`/dashboard/circles/${newCircleId}`)}
        />

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
          {/* Reserve / Emergency Fund — shown when enabled */}
          {(circle as any).reserveEnabled && (
            <div className="mt-4 pt-4 border-t border-[var(--ov-14)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--muted)] mb-0.5">Reserve / Emergency Fund</p>
                  <p className="text-sm text-[var(--text)]">
                    {(circle as any).reservePercentage || 0}% of each contribution
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--muted)] mb-0.5">Reserve Balance</p>
                  <p className="text-lg font-semibold text-[var(--text)]">
                    {formatSettlementAmount(currentReserveBalance, contributionAmount.currency)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                <strong className="text-[var(--text)]">How it works:</strong> Each member contributes {(circle as any).reservePercentage || 0}% of their payment into a shared reserve. If a member misses a payment, the reserve covers the shortfall so payouts stay on schedule. At the end of the circle, any unused reserve is split back to members proportionally.
              </p>
            </div>
          )}
          <p className="text-xs text-[var(--muted)]">Created {circle.createdAt}</p>
        </div>
{/* Waitlist position — only meaningful for a non-member with a pending join request. */}
{!circle.isMember && <WaitlistPositionCard circleId={circle.id} currentWallet={CURRENT_WALLET} />}
        <section className="rounded-2xl bg-[var(--content)] p-6" aria-labelledby="circle-rules-heading">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="circle-rules-heading" className="text-lg font-bold font-sora text-[var(--text)]">Circle Rules / Constitution</h2>
              {circleRules && <p className="mt-1 text-xs text-[var(--muted)]">Last updated {new Date(circleRules.updatedAt).toLocaleString()}</p>}
            </div>
            {canManageCircle && <Link href={`/dashboard/circles/${circle.id}/settings`} className="text-sm font-medium text-[#4B6B76] hover:underline">Edit rules</Link>}
          </div>
          <div className="mt-4">
            {circleRules ? <CircleRulesView rules={circleRules} /> : (
              <div className="rounded-xl border border-dashed border-[var(--ov-14)] bg-[var(--ov-05)] px-4 py-5 text-sm text-[var(--muted)]">
                {canManageCircle ? <><p>No rules have been published yet.</p><Link href={`/dashboard/circles/${circle.id}/settings`} className="mt-2 inline-block font-medium text-[#4B6B76] hover:underline">Add circle rules</Link></> : <p>The organizer has not published circle rules yet.</p>}
              </div>
            )}
          </div>
        </section>

        {/* Circle FAQ — Issue #246 */}
        <section className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-sora text-[var(--text)]">FAQ</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Answers to common questions from the organizer</p>
            </div>
            {canManageCircle && (
              <Link href={`/dashboard/circles/${circle.id}/settings`} className="text-sm font-medium text-[#4B6B76] hover:underline">
                Edit FAQ
              </Link>
            )}
          </div>
          {circleFaq.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--ov-14)] bg-[var(--ov-05)] px-4 py-5 text-sm text-[var(--muted)]">
              {canManageCircle ? (
                <>
                  <p>No FAQ items yet.</p>
                  <Link href={`/dashboard/circles/${circle.id}/settings`} className="mt-2 inline-block font-medium text-[#4B6B76] hover:underline">
                    Add FAQ
                  </Link>
                </>
              ) : (
                <p>The organizer has not published an FAQ yet.</p>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-[var(--ov-14)] rounded-xl border border-[var(--ov-14)]">
              {circleFaq.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                    aria-expanded={openFaqId === item.id}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text)] hover:bg-[var(--ov-05)] transition-colors"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform text-[var(--muted)] ${openFaqId === item.id ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {openFaqId === item.id && (
                    <div className="px-4 pb-4 text-sm text-[var(--muted)]">{item.answer}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming payout */}
        {circle.status !== "completed" && <div className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-sora text-[var(--text)]">Upcoming Payout</h2>
            <CountdownTimer
              paused={pauseState.paused}
              deadline={
                circle.nextPayoutDeadline
                  ? new Date(circle.nextPayoutDeadline.getTime() + pauseState.totalPausedMs)
                  : null
              }
            />
          </div>
          {circle.nextPayoutDeadline && (
            <div className="flex flex-wrap items-center justify-between text-xs text-[var(--muted)] gap-2 bg-[var(--ov-05)] p-2.5 rounded-xl border border-[var(--ov-0a)]">
              <span>
                Payout Time: <strong className="text-[var(--text)]">{formatDateTime(new Date(circle.nextPayoutDeadline.getTime() + pauseState.totalPausedMs))}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  const deadlineDate = new Date(circle.nextPayoutDeadline!.getTime() + pauseState.totalPausedMs);
                  const ics = generateCalendarIcs(
                    [
                      {
                        id: `payout-${circle.id}-${circle.currentRound}`,
                        title: `${circle.name} Payout Deadline`,
                        description: `Payout deadline for ${circle.name}. Round ${circle.currentRound} of ${circle.totalRounds}.`,
                        startDate: deadlineDate,
                      },
                    ],
                    timezone
                  );
                  downloadIcsFile(`${circle.name.toLowerCase().replace(/\s+/g, "-")}-payout.ics`, ics);
                  showToast({ title: "Calendar event downloaded", variant: "success" });
                }}
                className="hover:text-[var(--text)] transition-colors underline font-medium"
              >
                Add to calendar (.ics)
              </button>
            </div>
          )}
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
          {circle.isMember && (
            <div className="flex items-center justify-between border-t border-[var(--ov-0f)] pt-4">
              <PayoutMethodBadge
                circleId={circle.id}
                currency={circleCurrency}
                label={isNextRecipient ? "Paid to" : "Your payout method"}
              />
              {payoutInProgress && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <Lock size={12} aria-hidden="true" />
                  Payout in progress
                </span>
              )}
            </div>
          )}
        </div>}

        {/* Payout method preference */}
        {circle.isMember && circle.status !== "completed" && (
          <PayoutMethodSelector
            circleId={circle.id}
            circleName={circle.name}
            currency={circleCurrency}
            payoutInProgress={payoutInProgress}
          />
        )}

        {/* Auto-Pay */}
        {circle.isMember && circle.status !== "completed" && (
          <AutoPaySection circleId={circle.id} defaultAmount={circle.contribution} roundDuration={circle.duration} />
        )}

        {/* Action buttons */}
        {circle.isMember && circle.status !== "completed" && (
          <div className="flex gap-3 flex-wrap">
            <button
              disabled={currentUserPaid}
              onClick={() => {
                setPaymentAmount(currentAmountDue.toFixed(2));
                setShowContributionForm(true);
              }}
              className="px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              {currentUserPaid ? "Contribution Made" : `Make Contribution (${circle.contribution})`}
            </button>
            <button
              disabled={!isNextRecipient}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${isNextRecipient
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

        {showContributionForm && circle.isMember && circle.status !== "completed" && (
          <form
            onSubmit={handleRecordContribution}
            className="max-w-xl space-y-4 rounded-2xl border border-[var(--ov-14)] bg-[var(--content)] p-5"
            aria-labelledby="record-contribution-heading"
          >
            <div>
              <h2 id="record-contribution-heading" className="font-semibold text-[var(--text)]">
                Record round {circle.currentRound} contribution
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {currentCreditBalance > 0
                  ? `${formatSettlementAmount(Math.min(currentCreditBalance, contributionAmount.amount), contributionAmount.currency)} credit is applied automatically.`
                  : "Any amount paid above the contribution due is carried forward as credit."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-[var(--muted)]">
                Amount paid ({contributionAmount.currency})
                <input
                  required
                  type="number"
                  min={currentAmountDue}
                  step="any"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--ov-14)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
                />
              </label>
              <div className="space-y-1 self-center text-xs text-[var(--muted)]">
                <p>Due after credit: <span className="font-medium text-[var(--text)]">{formatSettlementAmount(currentAmountDue, contributionAmount.currency)}</span></p>
                <p>New credit: <span className="font-medium text-[var(--text)]">{formatSettlementAmount(Math.max(0, (Number(paymentAmount) || 0) - currentAmountDue), contributionAmount.currency)}</span></p>
              </div>
            </div>
            <p className="text-[11px] text-amber-500">
              Demo ledger only: this records contribution and credit locally; it does not send a wallet transaction.
            </p>
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-[#4B6B76] px-4 py-2 text-sm font-medium text-white">
                {currentAmountDue === 0 && Number(paymentAmount) === 0 ? "Apply credit" : "Record payment"}
              </button>
              <button type="button" onClick={() => setShowContributionForm(false)} className="rounded-lg px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--ov-0a)]">
                Cancel
              </button>
            </div>
          </form>
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

        {circle.isMember && (
          <section className="space-y-3 rounded-2xl border border-[var(--ov-0f)] bg-[var(--content)] p-5" aria-labelledby="contribution-credit-heading">
            <div>
              <h2 id="contribution-credit-heading" className="font-semibold text-[var(--text)]">Contribution credits</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Available credit is applied to your next round automatically. Any balance left at circle completion is recorded as a refund.
              </p>
            </div>
            {visibleCreditRows.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[var(--ov-0a)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--ov-0a)] text-left">
                      {canManageCircle && <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted)]">Member</th>}
                      <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted)]">Available credit</th>
                      <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted)]">Refunded at completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCreditRows.map((row) => (
                      <tr key={row.address} className="border-b border-[var(--ov-05)] last:border-0">
                        {canManageCircle && <th scope="row" className="px-4 py-3 text-left font-mono font-normal text-[var(--text)]">{fmt(row.address)}</th>}
                        <td className="px-4 py-3 text-[var(--text)]">{formatSettlementAmount(row.balance, contributionAmount.currency)}</td>
                        <td className="px-4 py-3 text-[var(--text)]">{formatSettlementAmount(row.refunded, contributionAmount.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">No member credit balances to show.</p>
            )}
            {appliedThisRound > 0 && (
              <p className="text-xs text-[var(--status-paid)]">
                {formatSettlementAmount(appliedThisRound, contributionAmount.currency)} of your credit was applied to round {circle.currentRound}.
              </p>
            )}
            <p className="text-[11px] text-[var(--faint)]">Demo ledger is stored in this browser; refunds are ledger entries, not wallet transfers.</p>
          </section>
        )}

        <ContactDirectory
          participants={circle.participants}
          viewerAddress={CURRENT_WALLET}
          viewerIsMember={circle.isMember}
        />

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

        {/* Payout Schedule */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-bold font-sora text-[var(--text)] shrink-0">Payout Schedule</h2>
            <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
          </div>
          <PayoutScheduleTimeline
            participants={circle.participants}
            totalRounds={circle.totalRounds}
            currentRound={circle.currentRound}
            contribution={`${Number(circle.contribution.replace(/[^\d.]/g, "")) * circle.participants.length} USDT`}
            roundHistory={circle.roundHistory}
            nextPayoutDeadline={circle.nextPayoutDeadline}
            currentUserAddress={CURRENT_WALLET}
          />
        </div>

        {/* Round History */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-bold font-sora text-[var(--text)] shrink-0">Round History</h2>
            <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
          </div>
          <RoundHistoryTable rows={circle.roundHistory} />
        </div>

        {settlementReport && (
          <section className="space-y-4 rounded-2xl border border-[var(--ov-0f)] bg-[var(--content)] p-5" aria-labelledby="settlement-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="settlement-heading" className="text-lg font-bold font-sora text-[var(--text)]">End-of-cycle settlement</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Positive amounts are credits to members; negative amounts are refunds due to the circle.
                </p>
              </div>
              <ExportButton
                getRows={() => settlementExportRows}
                columns={SETTLEMENT_COLUMNS}
                scope={circle.name}
                prefix="settlement"
                title={`${circle.name} — Settlement Report`}
                disabled={settlementReport.members.length === 0}
              />
            </div>
            <p className={`text-sm font-medium ${settlementReport.reconciled ? "text-[var(--status-paid)]" : "text-amber-500"}`} role="status">
              {settlementReport.reconciled
                ? `Reconciled · net balance ${formatSettlementAmount(settlementReport.totals.creditOrRefund, settlementReport.currency)}`
                : `Unreconciled · net balance ${formatCreditOrRefund(settlementReport.totals.creditOrRefund, settlementReport.currency)}`}
            </p>
            <div className="overflow-x-auto rounded-xl border border-[var(--ov-0a)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ov-0a)] text-left">
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted)]">Member</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted)]">Total contributed</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted)]">Payout received</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted)]">Penalties</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted)]">Credit / (refund)</th>
                  </tr>
                </thead>
                <tbody>
                  {settlementReport.members.map((member) => (
                    <tr key={member.address} className="border-b border-[var(--ov-05)] last:border-0">
                      <th scope="row" className="px-4 py-3 text-left font-mono font-normal text-[var(--text)]">{fmt(member.address)}</th>
                      <td className="px-4 py-3 text-[var(--text)]">{formatSettlementAmount(member.totalContributed, settlementReport.currency)}</td>
                      <td className="px-4 py-3 text-[var(--text)]">{formatSettlementAmount(member.payoutReceived, settlementReport.currency)}</td>
                      <td className="px-4 py-3 text-[var(--text)]">{formatSettlementAmount(member.penalties, settlementReport.currency)}</td>
                      <td className="px-4 py-3 text-[var(--text)]">{formatCreditOrRefund(member.creditOrRefund, settlementReport.currency)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--ov-05)] font-semibold">
                    <th scope="row" className="px-4 py-3 text-left text-[var(--text)]">Total</th>
                    <td className="px-4 py-3 text-[var(--text)]">{formatSettlementAmount(settlementReport.totals.totalContributed, settlementReport.currency)}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{formatSettlementAmount(settlementReport.totals.payoutReceived, settlementReport.currency)}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{formatSettlementAmount(settlementReport.totals.penalties, settlementReport.currency)}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{formatCreditOrRefund(settlementReport.totals.creditOrRefund, settlementReport.currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Issue #245 – Payout Schedule Timeline */}
        {(() => {
          // Build a full timeline by merging completed rounds (from roundHistory)
          // with upcoming slots derived from participants ordered by slot number.
          const completedRounds = new Set(circle.roundHistory.map((r) => r.round));
          const sortedParticipants = [...circle.participants].sort(
            (a, b) => a.slot - b.slot
          );

          // Estimate a round duration in ms from the circle duration string.
          const durationDays = parseInt(circle.duration) || 7;
          const msPerRound = durationDays * 24 * 60 * 60 * 1000;

          const rounds: PayoutRound[] = Array.from(
            { length: circle.totalRounds },
            (_, i) => {
              const roundNum = i + 1;
              const participant = sortedParticipants[i] ?? null;
              const historyRow = circle.roundHistory.find(
                (r) => r.round === roundNum
              );

              let status: "paid" | "current" | "upcoming" = "upcoming";
              if (historyRow) {
                status = "paid";
              } else if (roundNum === circle.currentRound) {
                status = "current";
              }

              // Estimate date: past rounds use completedAt from history,
              // future/current rounds project forward from now.
              let dateStr: string;
              if (historyRow?.completedAt) {
                dateStr = new Date(historyRow.completedAt).toISOString();
              } else {
                const offsetRounds = roundNum - circle.currentRound;
                dateStr = new Date(
                  Date.now() + offsetRounds * msPerRound
                ).toISOString();
              }

              const recipientAddr =
                historyRow?.recipient ??
                participant?.address ??
                `Slot ${roundNum}`;

              return {
                round: roundNum,
                recipient: recipientAddr.length > 14
                  ? `${recipientAddr.slice(0, 6)}…${recipientAddr.slice(-4)}`
                  : recipientAddr,
                date: dateStr,
                status,
                isCurrentUser:
                  (participant?.address === CURRENT_WALLET) ||
                  (historyRow?.recipient === CURRENT_WALLET),
              } satisfies PayoutRound;
            }
          );

          return (
            <div>
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-bold font-sora text-[var(--text)] shrink-0">
                  Payout Schedule
                </h2>
                <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
              </div>
              <PayoutScheduleTimeline rounds={rounds} />
            </div>
          );
        })()}

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
          <ActivityFeed events={[...circleEvents, ...announcementEvents]} pageSize={5} />
          <ActivityFeed events={[...MOCK_EVENTS, ...announcementEvents, ...inviteEvents, ...pauseEvents]} pageSize={5} />
        </div>

        <ExportButton
          getRows={getExportRows}
          scope={circle.name}
          prefix="circle"
          title={`${circle.name} — Transaction History`}
        />

        {/* Download Agreement Button - available to all members */}
        {circle.isMember && (
          <div className="pt-4 border-t border-[var(--ov-0f)]">
            <DownloadAgreementButton
              data={{
                circle: {
                  id: circle.id,
                  name: circle.name,
                  contribution: circle.contribution,
                  duration: circle.duration,
                  totalRounds: circle.totalRounds,
                  currentRound: circle.currentRound,
                  status: circle.status,
                },
                rules: circleRules ? rulesMarkdownToList(circleRules.markdown) : [],
                participants: circle.participants.map((p) => ({
                  address: p.address,
                  displayName: p.role,
                })),
                schedule: circle.roundHistory.map((r) => ({
                  round: r.round,
                  date: r.completedAt,
                  payout: r.amount,
                })),
              }}
            />
          </div>
        )}
      </div>

      {/* ── Discussion tab ── */}
      <div
        role="tabpanel"
        id="tabpanel-discussion"
        aria-labelledby="tab-discussion"
        hidden={activeTab !== "discussion"}
        className={activeTab === "discussion" ? "space-y-6" : ""}
      >
        {circle.isMember && (
          <>
            <DiscussionThread
              comments={comments}
              currentAddress={CURRENT_WALLET}
              circleId={id}
              organizerAddress={circle.creator}
              canModerate={moderation.canModerate}
              canPin={moderation.canPin}
              onReply={handleReplyComment}
              onPin={handlePinComment}
              onUnpin={handleUnpinComment}
              onDeleteComment={handleDeleteComment}
              disabled={false}
              onModerationAction={handleModerationAction}
            />
            <CirclePolls
              circleId={id}
              currentAddress={CURRENT_WALLET}
              canCreate={circle.isOrganizer || circle.isCoOrganizer}
            />
            <CommentComposer
              onSubmit={handlePostComment}
              disabled={false}
            />
          </>
        )}
        {!circle.isMember && (
          <div className="text-center py-8 text-[var(--muted)]">
            Only circle members can participate in discussions.
          </div>
        )}
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
