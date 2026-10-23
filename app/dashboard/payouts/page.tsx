"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, ChevronDown, FileText, X, AlertTriangle, Send } from "lucide-react";
import ExportButton from "@/components/ui/ExportButton";
import ShareMilestoneButton from "@/components/ui/ShareMilestoneButton";
import GlossaryTerm from "@/components/ui/GlossaryTerm";
import type { ExportRow } from "@/lib/export";
import type { MilestoneData } from "@/types/milestone";
import {
  MOCK_PAYOUT_HISTORY,
  formatPayoutAmount,
  type PayoutRecord,
  type PayoutStatus,
} from "@/data/payouts";
import { useLoadMore } from "@/hooks/useLoadMore";

// ---------------------------------------------------------------------------
// Local formatting helpers (screen-only variants, keep in sync with data/payouts.ts)
// ---------------------------------------------------------------------------
function formatAmount(amount: number, tokenSymbol: string) {
  return formatPayoutAmount(amount, tokenSymbol);
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

function truncateHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function statusStyles(status: PayoutStatus) {
  if (status === "completed") {
    return "bg-[#1f3b2d] text-[#8ef0b0] border-[#2d5c43]";
  }
  return "bg-[#3a2f18] text-[#ffd56a] border-[#665221]";
}

export default function PayoutsPage() {
  const { visibleCount, hasMore, loadMore, sentinelRef, announcement } = useLoadMore(
    MOCK_PAYOUT_HISTORY.length,
    "dashboard:payouts"
  );
  const visiblePayouts = MOCK_PAYOUT_HISTORY.slice(0, visibleCount);

  const checklist = MOCK_ROUND_CLOSE_CHECKLIST;
  const unpaidMembers = useMemo(
    () => checklist.members.filter((member) => !member.paid),
    [checklist.members]
  );
  const balanceSufficient = checklist.poolBalance >= checklist.expectedPayout;

  const openChecklist = useCallback(() => {
    setReminderSent(false);
    setChecklistOpen(true);
  }, []);

  const closeChecklist = useCallback(() => {
    setChecklistOpen(false);
  }, []);

  const sendReminder = useCallback(() => {
    setReminderSent(true);
  }, []);

  // Exports the full history, not just the rows currently paged into view.
  const getExportRows = useCallback(
    (): ExportRow[] =>
      MOCK_PAYOUT_HISTORY.map((payout) => ({
        date: formatDate(payout.payout_date),
        circleName: payout.circle_name,
        round: payout.round_number,
        amount: formatAmount(payout.amount, payout.token_symbol),
        type: payout.status === "completed" ? "Payout" : "Payout (pending)",
        transactionHash: payout.transaction_hash,
      })),
    []
  );

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Trustless transparency
          </p>
          <h1 className="mt-2 text-3xl font-bold font-sora text-[var(--text)]">
            Payout history
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted2)]">
            Review every completed and pending{" "}
            <GlossaryTerm term="payout">payout</GlossaryTerm> from your circles. Each
            transaction links to a{" "}
            <GlossaryTerm term="block-explorer">block explorer</GlossaryTerm> for independent
            verification.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={openChecklist}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition-opacity hover:opacity-90"
          >
            <FileText size={16} aria-hidden="true" />
            Release payout
          </button>
          <div className="rounded-2xl border border-[var(--ov-14)] bg-[var(--modal)] px-4 py-3 text-sm text-[var(--muted2)]">
            <span className="font-semibold text-[var(--text)]">{MOCK_PAYOUT_HISTORY.length}</span> total payouts
          </div>
        </div>
      </div>

      {checklistOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="round-close-checklist-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--ov-12)] bg-[var(--modal)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="round-close-checklist-title"
                  className="text-xl font-semibold text-[var(--text)]"
                >
                  Round close checklist
                </h2>
                <p className="mt-1 text-sm text-[var(--muted2)]">
                  {checklist.circleName} · Round {checklist.roundNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={closeChecklist}
                className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--ov-08)] hover:text-[var(--text)]"
                aria-label="Close checklist"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[var(--ov-12)] bg-[var(--ov-05)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Pool balance vs expected
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold text-[var(--text)]">
                    {formatAmount(checklist.poolBalance, checklist.tokenSymbol)}
                  </span>
                  <span className="text-sm text-[var(--muted2)]">
                    expected {formatAmount(checklist.expectedPayout, checklist.tokenSymbol)}
                  </span>
                </div>
                {!balanceSufficient && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#ff8a8a]">
                    <AlertTriangle size={14} aria-hidden="true" />
                    Pool balance is insufficient to cover the payout.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--ov-12)] bg-[var(--ov-05)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Recipient address
                </p>
                <p className="mt-2 break-all font-mono text-sm text-[var(--text)]">
                  {checklist.recipientAddress}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--ov-12)] bg-[var(--ov-05)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Members ({checklist.members.length - unpaidMembers.length}/{checklist.members.length} paid)
                </p>
                <ul className="mt-3 space-y-2">
                  {checklist.members.map((member) => (
                    <li
                      key={member.address}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-[var(--text)]">{member.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                          member.paid
                            ? "bg-[#1f3b2d] text-[#8ef0b0] border-[#2d5c43]"
                            : "bg-[#3a2f18] text-[#ffd56a] border-[#665221]"
                        }`}
                      >
                        {member.paid ? "Paid" : "Unpaid"}
                      </span>
                    </li>
                  ))}
                </ul>
                {unpaidMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={sendReminder}
                    disabled={reminderSent}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[var(--ov-14)] px-3 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--ov-08)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={14} aria-hidden="true" />
                    {reminderSent
                      ? "Reminder sent"
                      : `Send reminder to ${unpaidMembers.length} unpaid`}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeChecklist}
                className="rounded-xl border border-[var(--ov-14)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--ov-08)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={closeChecklist}
                disabled={!balanceSufficient}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                Confirm release
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-[var(--ov-12)] bg-[var(--modal)] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        {MOCK_PAYOUT_HISTORY.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--ov-14)] bg-[var(--ov-08)] text-[var(--text)]">
              <CheckCircle2 size={24} aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text)]">No payouts yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              When your circles start distributing funds, the full payout
              history will appear here with transaction links for verification.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--ov-0f)]">
                <thead className="bg-[var(--ov-05)] text-left text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">
                      Circle Name
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      Round #
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      <span className="inline-flex items-center gap-1">
                        Transaction Hash
                        <GlossaryTerm term="transaction-hash" iconOnly placement="bottom" />
                      </span>
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      <span className="sr-only">Share</span>
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      <span className="sr-only">Receipt</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ov-0f)] bg-[var(--modal)]">
                  {visiblePayouts.map((payout) => (
                    <tr key={payout.transaction_hash} className="transition-colors hover:bg-[var(--ov-06)]">
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">
                        {payout.circle_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text)]">
                        {formatAmount(payout.amount, payout.token_symbol)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted2)]">
                        {formatDate(payout.payout_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted2)]">
                        {payout.round_number}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`https://starkscan.co/tx/${payout.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--info)] transition-colors hover:text-[var(--text)]"
                          aria-label={`Open transaction ${payout.transaction_hash} in a new tab`}
                        >
                          <span className="font-mono">
                            {truncateHash(payout.transaction_hash)}
                          </span>
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles(
                            payout.status
                          )}`}
                        >
                          {payout.status === "completed" ? (
                            <CheckCircle2 size={12} aria-hidden="true" />
                          ) : (
                            <Clock3 size={12} aria-hidden="true" />
                          )}
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <ShareMilestoneButton
                          milestone={
                            {
                              id: payout.transaction_hash,
                              title: `${payout.circle_name} payout`,
                              description: `Round ${payout.round_number} payout of ${formatAmount(
                                payout.amount,
                                payout.token_symbol
                              )}`,
                              amount: payout.amount,
                              tokenSymbol: payout.token_symbol,
                              circleName: payout.circle_name,
                              date: payout.payout_date,
                            } as MilestoneData
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/dashboard/payouts/${payout.transaction_hash}`}
                          className="inline-flex items-center gap-1 text-[var(--info)] transition-colors hover:text-[var(--text)]"
                        >
                          <FileText size={14} aria-hidden="true" />
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div ref={sentinelRef} aria-hidden="true" className="h-px" />
            <div className="flex items-center justify-between gap-4 border-t border-[var(--ov-0f)] px-6 py-4">
              <p className="text-sm text-[var(--muted)]" role="status" aria-live="polite">
                {announcement || `Showing ${visiblePayouts.length} of ${MOCK_PAYOUT_HISTORY.length} payouts`}
              </p>

              {hasMore ? (
                <button
                  type="button"
                  onClick={loadMore}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--ov-16)] bg-[var(--ov-08)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--ov-10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  Load more
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
