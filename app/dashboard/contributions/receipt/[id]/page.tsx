"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Printer,
  Send,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import {
  findContributionReceipt,
  getContributionReceiptId,
  getReceiptResendCooldownMs,
  resendContributionReceipt,
} from "@/lib/contributionReceipts";
import type { ContributionStatus } from "@/types/contribution";
import { formatCurrency } from "@/lib/currencyFormat";

// Layout mirrors the payout receipt (app/dashboard/payouts/receipt/[txHash])
// so both emailed receipts look like the same document family.

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(`${value}T00:00:00`));
}

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
      <dt className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </dt>
      <dd className={`text-sm text-gray-800 break-all ${mono ? "font-mono" : "font-medium"}`}>
        {children ?? value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: ContributionStatus }) {
  if (status === "on-time") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
        <CheckCircle2 size={13} aria-hidden="true" />
        Paid on time
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
      <Clock3 size={13} aria-hidden="true" />
      Paid late
    </span>
  );
}

export default function ContributionReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contribution = findContributionReceipt(id);
  const { showToast } = useToast();
  const { email } = useEmailVerification();
  const [sending, setSending] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);

  useEffect(() => {
    setCooldownMs(getReceiptResendCooldownMs(id));
    const interval = setInterval(() => setCooldownMs(getReceiptResendCooldownMs(id)), 1000);
    return () => clearInterval(interval);
  }, [id]);

  // ---- Not found (unknown id, or a missed contribution with no payment) ----
  if (!contribution) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center print:hidden">
        <AlertTriangle size={40} className="text-amber-600" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Receipt not found</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-sm">
            No paid contribution matches <span className="font-mono break-all">{id}</span>.
          </p>
        </div>
        <Link
          href="/dashboard/contributions"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to contributions
        </Link>
      </div>
    );
  }

  const receiptId = getContributionReceiptId(contribution);
  const recipient = email ?? "the email address on your account";
  const subject = `Your contribution receipt — ${contribution.circleName}, Round ${contribution.round}`;
  const amount = formatCurrency(contribution.amount, "USDT");

  const handleResend = async () => {
    setSending(true);
    try {
      await resendContributionReceipt(contribution.id);
      setCooldownMs(getReceiptResendCooldownMs(contribution.id));
      showToast({
        title: "Receipt sent",
        message: `We emailed the receipt for ${contribution.circleName} round ${contribution.round} to ${recipient}.`,
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: "Couldn't resend receipt",
        message: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Screen-only toolbar                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6 py-3">
        <Link
          href="/dashboard/contributions"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Contribution history
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <Printer size={15} aria-hidden="true" />
            Print
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={sending || cooldownMs > 0}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {sending ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
            {sending ? "Sending…" : cooldownMs > 0 ? `Resend in ${Math.ceil(cooldownMs / 1000)}s` : "Resend receipt"}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Email envelope (screen only) — what the inbox shows above the body */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-label="Email details"
        className="print:hidden mx-auto max-w-2xl px-6 pt-8"
      >
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-700">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            <Mail size={13} aria-hidden="true" />
            Email preview
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-gray-500">From</dt>
            <dd>Ahjoor Receipts &lt;receipts@ahjoor.finance&gt;</dd>
            <dt className="text-gray-500">To</dt>
            <dd className="break-all">{recipient}</dd>
            <dt className="text-gray-500">Subject</dt>
            <dd className="font-medium text-gray-900">{subject}</dd>
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Receipt document                                                    */}
      {/* ------------------------------------------------------------------ */}
      <main
        id="receipt-document"
        className="mx-auto max-w-2xl px-6 py-12 print:px-0 print:py-0 print:max-w-none"
      >
        <header className="flex items-start justify-between mb-10 print:mb-8">
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

          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">
              Contribution Receipt
            </p>
            <p className="text-sm font-mono font-semibold text-gray-700">
              {receiptId}
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 mb-8 print:rounded-none print:border-x-0 print:border-t-0 print:border-b-2 print:border-gray-200 print:bg-white print:p-4 print:mb-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-medium text-gray-600">Amount contributed</p>
            <StatusBadge status={contribution.status} />
          </div>
          <p className="text-4xl font-bold tracking-tight text-gray-900 print:text-3xl">
            {amount}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            to{" "}
            <span className="font-semibold text-gray-800">{contribution.circleName}</span>
          </p>
        </div>

        <section aria-label="Receipt details">
          <dl>
            <ReceiptField label="Amount" value={amount} />
            <ReceiptField label="Circle" value={contribution.circleName} />
            <ReceiptField label="Round" value={`Round ${contribution.round}`} />
            <ReceiptField label="Paid on" value={formatTimestamp(contribution.date)} />
            <ReceiptField label="Due on" value={formatTimestamp(contribution.dueDate)} />
            <ReceiptField label="Transaction hash" mono>
              <span className="break-all">{contribution.transactionHash}</span>
            </ReceiptField>
            <ReceiptField label="Receipt ID" mono value={receiptId} />
            <ReceiptField label="Status">
              <StatusBadge status={contribution.status} />
            </ReceiptField>
          </dl>
        </section>

        <footer className="mt-12 pt-6 border-t border-gray-200 print:mt-8 print:pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              <p className="font-medium text-gray-600 mb-0.5">Ahjoor Finance</p>
              <p>Decentralised savings circles</p>
              <p className="mt-0.5">ahjoor.finance</p>
            </div>
            <div className="text-right print:text-right">
              <p>This receipt is for informational purposes only.</p>
              <p>The on-chain transaction is the authoritative record.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
