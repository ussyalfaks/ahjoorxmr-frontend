"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Clock3, ExternalLink, Loader2, X, XCircle } from "lucide-react";
import {
  advancePendingTransactions,
  dismissPendingTransaction,
  getPendingTransactions,
  getTransactionExplorerUrl,
  subscribeToPendingTransactions,
  type PendingTransaction,
  type PendingTransactionStatus,
} from "@/lib/pendingTransactions";

const STATUS_LABELS: Record<PendingTransactionStatus, string> = {
  submitted: "Submitted",
  confirming: "Confirming",
  confirmed: "Confirmed",
  failed: "Failed",
};

const STATUS_STYLES: Record<PendingTransactionStatus, string> = {
  submitted: "text-blue-500",
  confirming: "text-amber-500",
  confirmed: "text-emerald-500",
  failed: "text-red-500",
};

function StatusIcon({ status }: { status: PendingTransactionStatus }) {
  if (status === "confirmed") return <CheckCircle2 size={15} aria-hidden="true" />;
  if (status === "failed") return <XCircle size={15} aria-hidden="true" />;
  if (status === "confirming") return <Loader2 size={15} className="animate-spin" aria-hidden="true" />;
  return <Clock3 size={15} aria-hidden="true" />;
}

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export default function PendingTransactionsTracker() {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setTransactions(getPendingTransactions());
    refresh();
    const unsubscribe = subscribeToPendingTransactions(refresh);
    const interval = window.setInterval(() => {
      advancePendingTransactions();
      refresh();
    }, 1000);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, []);

  const activeCount = transactions.filter((transaction) =>
    transaction.status === "submitted" || transaction.status === "confirming"
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Transaction tracker${activeCount ? `, ${activeCount} active` : ""}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--ov-14)] text-[var(--muted)] transition-colors hover:border-[#4B6B76] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      >
        <Clock3 size={16} aria-hidden="true" />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-black">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-150 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--ov-14)] bg-[var(--modal)] shadow-2xl" role="dialog" aria-label="Transaction tracker">
          <div className="flex items-center justify-between border-b border-[var(--ov-10)] px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">Transaction tracker</h2>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">Live updates for this session</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--ov-08)] hover:text-[var(--text)]" aria-label="Close transaction tracker">
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[var(--muted)]">No recent transactions.</div>
          ) : (
            <div className="max-h-[min(24rem,70vh)] divide-y divide-[var(--ov-08)] overflow-y-auto">
              {transactions.map((transaction) => {
                const terminal = transaction.status === "confirmed" || transaction.status === "failed";
                return (
                  <div key={transaction.id} className="space-y-2 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[var(--text)]">{transaction.label}</p>
                        {transaction.amount && <p className="text-[11px] text-[var(--muted)]">{transaction.amount}</p>}
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold ${STATUS_STYLES[transaction.status]}`}>
                        <StatusIcon status={transaction.status} />
                        {STATUS_LABELS[transaction.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <a href={getTransactionExplorerUrl(transaction)} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1 font-mono text-[10px] text-[var(--muted)] hover:text-[var(--text)]" title="Open in block explorer">
                        <span className="truncate">{shortHash(transaction.hash)}</span>
                        <ExternalLink size={11} aria-hidden="true" />
                      </a>
                      {terminal && (
                        <button type="button" onClick={() => dismissPendingTransaction(transaction.id)} className="shrink-0 text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
