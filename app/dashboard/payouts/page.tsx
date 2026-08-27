"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, ChevronDown, FileText } from "lucide-react";
import ExportButton from "@/components/ui/ExportButton";
import ShareMilestoneButton from "@/components/ui/ShareMilestoneButton";
import type { ExportRow } from "@/lib/export";
import type { MilestoneData } from "@/types/milestone";
import {
  MOCK_PAYOUT_HISTORY,
  formatPayoutAmount,
  type PayoutRecord,
  type PayoutStatus,
} from "@/data/payouts";

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

const PAGE_SIZE = 5;

export default function PayoutsPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visiblePayouts = useMemo(
    () => MOCK_PAYOUT_HISTORY.slice(0, visibleCount),
    [visibleCount]
  );

  const hasMore = visibleCount < MOCK_PAYOUT_HISTORY.length;

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
            Review every completed and pending payout from your circles. Each
            transaction links directly to the blockchain for independent
            verification.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--ov-14)] bg-[var(--modal)] px-4 py-3 text-sm text-[var(--muted2)]">
          <span className="font-semibold text-[var(--text)]">{MOCK_PAYOUT_HISTORY.length}</span> total payouts
        </div>
      </div>

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
                      Transaction Hash
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
                          {payout.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payout.status === "completed" && (
                          <ShareMilestoneButton
                            milestone={{
                              type: "payout_received",
                              circleName: payout.circle_name,
                              amount: formatAmount(payout.amount, payout.token_symbol),
                              subtitle: `Round ${payout.round_number}`,
                              date: formatDate(payout.payout_date),
                            } satisfies MilestoneData}
                            variant="icon"
                          />
                        )}
                      </td>
                      {/* Receipt button */}
                      <td className="px-4 py-4 text-sm">
                        <Link
                          href={`/dashboard/payouts/receipt/${payout.transaction_hash}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted)] bg-[var(--ov-07)] hover:bg-[var(--ov-0f)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] whitespace-nowrap"
                          aria-label={`View receipt for ${payout.circle_name} round ${payout.round_number}`}
                        >
                          <FileText size={13} aria-hidden="true" />
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--ov-0f)] px-6 py-4">
              <p className="text-sm text-[var(--muted)]">
                Showing {visiblePayouts.length} of {MOCK_PAYOUT_HISTORY.length} payouts
              </p>

              {hasMore ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--ov-16)] bg-[var(--ov-08)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--ov-10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  Load more
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              ) : (
                <span className="text-sm text-[var(--muted)]">All payouts loaded</span>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}