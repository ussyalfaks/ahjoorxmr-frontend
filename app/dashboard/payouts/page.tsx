"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, ChevronDown } from "lucide-react";
import ExportButton from "@/components/ui/ExportButton";
import type { ExportRow } from "@/lib/export";

type PayoutStatus = "completed" | "pending";

interface PayoutRecord {
  transaction_hash: string;
  circle_name: string;
  amount: number;
  token_symbol: string;
  payout_date: string;
  round_number: number;
  status: PayoutStatus;
}

const MOCK_PAYOUT_HISTORY: PayoutRecord[] = [
  {
    transaction_hash: "0x8f41a8dd0a13cc9c5f8d25c8e2f2f2a34e1d0b4f0a5a9d6c7b8c9d0e1f2a3b4c",
    circle_name: "Family Growth",
    amount: 50,
    token_symbol: "USDT",
    payout_date: "2026-07-25T16:20:00Z",
    round_number: 3,
    status: "completed",
  },
  {
    transaction_hash: "0x4c2f19ab31d8f4e5c9b0d7a23e1f4a8b6c5d4e3f2a1b09876543210fedcba98",
    circle_name: "School Fees",
    amount: 120,
    token_symbol: "USDC",
    payout_date: "2026-07-22T10:05:00Z",
    round_number: 2,
    status: "completed",
  },
  {
    transaction_hash: "0x19d3b7f5a8c1e2d4f6b7a9c0d1e3f4a5b6c7d8e9f0a1234567890abcdef1234",
    circle_name: "Car Repairs",
    amount: 75,
    token_symbol: "STRK",
    payout_date: "2026-07-18T08:45:00Z",
    round_number: 1,
    status: "completed",
  },
  {
    transaction_hash: "0x7b6a5d4c3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3210ab9cd8ef7654",
    circle_name: "Wedding Fund",
    amount: 200,
    token_symbol: "USDT",
    payout_date: "2026-07-10T14:00:00Z",
    round_number: 4,
    status: "completed",
  },
  {
    transaction_hash: "0x2d4f6b8a1c3e5f7a9d0b2c4e6f8a1d3c5e7f9b0a2c4e6f8a1d3c5e7f9b0a2c4",
    circle_name: "Community Project",
    amount: 35,
    token_symbol: "USDC",
    payout_date: "2026-07-02T11:30:00Z",
    round_number: 2,
    status: "pending",
  },
  {
    transaction_hash: "0x6e5d4c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5c4b3a291807",
    circle_name: "Savings Challenge",
    amount: 90,
    token_symbol: "USDT",
    payout_date: "2026-06-28T09:15:00Z",
    round_number: 5,
    status: "completed",
  },
  {
    transaction_hash: "0x9a8b7c6d5e4f3210ab9cd8ef7654c3b2a1908f7e6d5c4b3a291807f6e5d4c3b",
    circle_name: "Travel Fund",
    amount: 150,
    token_symbol: "STRK",
    payout_date: "2026-06-19T07:55:00Z",
    round_number: 1,
    status: "completed",
  },
  {
    transaction_hash: "0x3c5e7f9b0a2c4e6f8a1d3c5e7f9b0a2c4e6f8a1d3c5e7f9b0a2c4e6f8a1d3c",
    circle_name: "Emergency Fund",
    amount: 60,
    token_symbol: "USDC",
    payout_date: "2026-06-11T18:40:00Z",
    round_number: 6,
    status: "pending",
  },
];

const PAGE_SIZE = 5;

function formatAmount(amount: number, tokenSymbol: string) {
  return `${amount.toLocaleString()} ${tokenSymbol}`;
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