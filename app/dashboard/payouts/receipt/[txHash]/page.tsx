"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  Clock3,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  findPayoutByHash,
  formatPayoutAmount,
  formatPayoutDate,
} from "@/data/payouts";

// ---------------------------------------------------------------------------
// Print + PDF helpers (client-side only)
// ---------------------------------------------------------------------------
function triggerPrint() {
  window.print();
}

/**
 * "Download as PDF" — opens the receipt in a new tab and immediately triggers
 * the browser's print dialog with destination "Save as PDF".
 * This is the standard no-library approach endorsed by the task spec.
 */
function triggerPdfDownload(txHash: string) {
  const url = `/dashboard/payouts/receipt/${txHash}?pdf=1`;
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (win) {
    win.addEventListener("load", () => {
      win.print();
    });
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ReceiptField({
  label,
  value,
  mono = false,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 py-4 border-b border-gray-100 last:border-0 print:py-3">
      <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </dt>
      <dd className={`text-sm text-gray-800 break-all ${mono ? "font-mono" : "font-medium"}`}>
        {children ?? value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: "completed" | "pending" }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
        <CheckCircle2 size={13} aria-hidden="true" />
        Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
      <Clock3 size={13} aria-hidden="true" />
      Pending
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PayoutReceiptPage({
  params,
}: {
  params: Promise<{ txHash: string }>;
}) {
  const { txHash } = use(params);
  const payout = findPayoutByHash(txHash);

  // ---- Not found ----
  if (!payout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center print:hidden">
        <AlertTriangle size={40} className="text-amber-500" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Receipt not found</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            No payout record matches transaction{" "}
            <span className="font-mono break-all">{txHash}</span>.
          </p>
        </div>
        <Link
          href="/dashboard/payouts"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to payout history
        </Link>
      </div>
    );
  }

  const receiptId = `AHJR-${payout.transaction_hash.slice(2, 10).toUpperCase()}`;
  const printedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Screen-only toolbar                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6 py-3">
        <Link
          href="/dashboard/payouts"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Payout history
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerPrint}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <Printer size={15} aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            onClick={() => triggerPdfDownload(txHash)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <Download size={15} aria-hidden="true" />
            Download PDF
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Receipt document                                                    */}
      {/* ------------------------------------------------------------------ */}
      <main
        id="receipt-document"
        className="mx-auto max-w-2xl px-6 py-12 print:px-0 print:py-0 print:max-w-none"
      >
        {/* Header */}
        <header className="flex items-start justify-between mb-10 print:mb-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full border-2 border-gray-900 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="font-bold text-base text-gray-900">$</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Ahjoor
            </span>
          </div>

          {/* Receipt meta */}
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
              Payout Receipt
            </p>
            <p className="text-sm font-mono font-semibold text-gray-700">
              {receiptId}
            </p>
          </div>
        </header>

        {/* Status + Amount hero */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 mb-8 print:rounded-none print:border-x-0 print:border-t-0 print:border-b-2 print:border-gray-200 print:bg-white print:p-4 print:mb-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-medium text-gray-500">Amount received</p>
            <StatusBadge status={payout.status} />
          </div>
          <p className="text-4xl font-bold tracking-tight text-gray-900 print:text-3xl">
            {formatPayoutAmount(payout.amount, payout.token_symbol)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            from{" "}
            <span className="font-semibold text-gray-800">{payout.circle_name}</span>
          </p>
        </div>

        {/* Details table */}
        <section aria-label="Receipt details">
          <dl>
            <ReceiptField label="Circle name" value={payout.circle_name} />
            <ReceiptField label="Round number" value={`Round ${payout.round_number}`} />
            <ReceiptField
              label="Date & time"
              value={formatPayoutDate(payout.payout_date)}
            />
            <ReceiptField label="Recipient wallet" mono>
              {payout.recipient}
            </ReceiptField>
            <ReceiptField label="Transaction hash" mono>
              <span className="break-all">{payout.transaction_hash}</span>
            </ReceiptField>
            <ReceiptField label="On-chain verification">
              {/* Screen: clickable link */}
              <a
                href={`https://starkscan.co/tx/${payout.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="print:hidden inline-flex items-center gap-1 text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                aria-label="View on Starkscan block explorer (opens in new tab)"
              >
                View on Starkscan
                <ExternalLink size={12} aria-hidden="true" />
              </a>
              {/* Print: plain URL */}
              <span className="hidden print:inline text-gray-600 break-all">
                https://starkscan.co/tx/{payout.transaction_hash}
              </span>
            </ReceiptField>
            <ReceiptField label="Receipt ID" mono value={receiptId} />
            <ReceiptField label="Status">
              <StatusBadge status={payout.status} />
            </ReceiptField>
          </dl>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 print:mt-8 print:pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-400">
            <div>
              <p className="font-medium text-gray-500 mb-0.5">Ahjoor Finance</p>
              <p>Decentralised savings circles on StarkNet</p>
              <p className="mt-0.5">ahjoor.finance</p>
            </div>
            <div className="text-right print:text-right">
              <p>Printed {printedAt}</p>
              <p className="mt-0.5">
                This receipt is for informational purposes only.
              </p>
              <p>
                The on-chain transaction is the authoritative record.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
