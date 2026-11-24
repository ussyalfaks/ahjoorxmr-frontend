"use client";

import { useState } from "react";
import { ChevronDown, Check, Clock, CircleDot } from "lucide-react";
import { Avatar } from "@/components/circles/ParticipantList";
import { truncateAddress } from "@/contexts/WalletContext";

interface TimelineParticipant {
  address: string;
  slot: number;
}

interface RoundHistoryRow {
  round: number;
  recipient: string;
  amount: string;
  completedAt: string;
}

/** Pre-built round descriptor — pass `rounds` instead of the raw
 *  participants/history props when the caller has already assembled
 *  the schedule (e.g. the circle detail page IIFE). */
export interface PayoutRound {
  round: number;
  recipient: string;
  date: string;
  status: "paid" | "current" | "upcoming";
  isCurrentUser: boolean;
}

type PayoutScheduleTimelineProps =
  | {
      /** Pre-built schedule — caller provides fully-assembled rounds. */
      rounds: PayoutRound[];
      participants?: never;
      totalRounds?: never;
      currentRound?: never;
      contribution?: never;
      roundHistory?: never;
      nextPayoutDeadline?: never;
      currentUserAddress?: never;
    }
  | {
      rounds?: never;
      participants: TimelineParticipant[];
      totalRounds: number;
      currentRound: number;
      contribution: string;
      roundHistory: RoundHistoryRow[];
      /** Deadline for the *current* round's payout, if known. */
      nextPayoutDeadline?: Date | null;
      /** Whose row to highlight — typically the signed-in wallet's address. */
      currentUserAddress: string;
    };

type RoundStatus = "paid" | "current" | "upcoming";

interface ScheduleRound {
  round: number;
  recipient: string;
  status: RoundStatus;
  amount: string;
  date: string | null;
}

// #244: the payout order isn't separately configured anywhere — it's
// exactly the slot assignment every participant already has (the same
// one `ParticipantList` sorts by), cycled if a circle somehow has more
// rounds than participants (shouldn't normally happen, but this keeps
// the schedule total rather than running off the end of the array).
function buildSchedule(
  participants: TimelineParticipant[],
  totalRounds: number,
  currentRound: number,
  contribution: string,
  roundHistory: RoundHistoryRow[],
): ScheduleRound[] {
  if (participants.length === 0) return [];
  const bySlot = [...participants].sort((a, b) => a.slot - b.slot);
  const historyByRound = new Map(roundHistory.map((row) => [row.round, row]));

  return Array.from({ length: totalRounds }, (_, i) => {
    const round = i + 1;
    const recipient = bySlot[i % bySlot.length].address;
    const history = historyByRound.get(round);
    const status: RoundStatus = round < currentRound ? "paid" : round === currentRound ? "current" : "upcoming";
    return {
      round,
      recipient: history?.recipient ?? recipient,
      status,
      amount: history?.amount ?? contribution,
      date: history?.completedAt ?? null,
    };
  });
}

const STATUS_CONFIG: Record<RoundStatus, { label: string; icon: typeof Check; dot: string; text: string }> = {
  paid: { label: "Paid", icon: Check, dot: "bg-[var(--success)]", text: "text-[var(--success)]" },
  current: { label: "Current", icon: CircleDot, dot: "bg-[#4B6B76]", text: "text-[#4B6B76]" },
  upcoming: { label: "Upcoming", icon: Clock, dot: "bg-[var(--ov-14)]", text: "text-[var(--muted)]" },
};

export default function PayoutScheduleTimeline(props: PayoutScheduleTimelineProps) {
  // #244: collapsed by default on mobile so the detail page's most
  // important content (status, actions) isn't pushed below a long list
  // on a small screen; desktop shows it open since there's room.
  const [collapsed, setCollapsed] = useState(true);

  // Support both the pre-built `rounds` prop and the raw-data props.
  const schedule: ScheduleRound[] = props.rounds
    ? props.rounds.map((r) => ({
        round: r.round,
        recipient: r.recipient,
        status: r.status,
        amount: "",
        date: r.date,
      }))
    : buildSchedule(
        props.participants,
        props.totalRounds,
        props.currentRound,
        props.contribution,
        props.roundHistory,
      );

  const currentRound = props.rounds ? null : props.currentRound;
  const totalRounds = props.rounds ? schedule.length : props.totalRounds;
  const nextPayoutDeadline = props.rounds ? null : (props.nextPayoutDeadline ?? null);
  const currentUserAddress = props.rounds ? "" : props.currentUserAddress;

  // For pre-built rounds, isCurrentUser is already flagged on the item.
  const isCurrentUser = (row: ScheduleRound) =>
    props.rounds
      ? props.rounds.find((r) => r.round === row.round)?.isCurrentUser ?? false
      : row.recipient.toLowerCase() === currentUserAddress.toLowerCase();

  if (schedule.length === 0) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white dark:border-[var(--border)] dark:bg-[var(--content)]">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-3 text-left md:cursor-default"
        aria-expanded={!collapsed}
        aria-controls="payout-schedule-list"
      >
        <h2 className="text-sm font-semibold text-gray-900 dark:text-[var(--text)]">
          Payout schedule{" "}
          {currentRound !== null && (
            <span className="font-normal text-gray-500 dark:text-[var(--muted)]">
              (round {currentRound} of {totalRounds})
            </span>
          )}
        </h2>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-gray-400 transition-transform md:hidden dark:text-[var(--muted)] ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      <ol
        id="payout-schedule-list"
        className={`space-y-0 border-t border-gray-100 px-4 py-4 dark:border-[var(--border)] ${collapsed ? "hidden md:block" : "block"}`}
      >
        {schedule.map((row, index) => {
          const config = STATUS_CONFIG[row.status];
          const Icon = config.icon;
          const isYou = isCurrentUser(row);
          const isLast = index === schedule.length - 1;

          return (
            <li key={row.round} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-gray-200 dark:bg-[var(--border)]"
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${config.dot}`}
              >
                <Icon size={14} aria-hidden="true" />
              </span>

              <div
                className={`flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 ${
                  isYou ? "bg-[#4B6B76]/10 ring-1 ring-[#4B6B76]/30" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar address={row.recipient} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-[var(--text)]">
                      Round {row.round} · {truncateAddress(row.recipient)}
                      {isYou && <span className="ml-1.5 text-xs font-semibold text-[#4B6B76]">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[var(--muted)]">
                      {row.amount || null}
                      {row.date
                        ? `${row.amount ? " · " : ""}${new Date(row.date).toLocaleDateString()}`
                        : row.status === "current" && nextPayoutDeadline
                          ? `${row.amount ? " · " : ""}due ${nextPayoutDeadline.toLocaleDateString()}`
                          : ""}
                    </p>
                  </div>
                </div>

                <span className={`shrink-0 text-xs font-semibold ${config.text}`}>{config.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
