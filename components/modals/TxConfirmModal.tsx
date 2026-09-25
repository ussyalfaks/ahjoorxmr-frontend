"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, CheckCircle2, XCircle, ExternalLink, X } from "lucide-react";
import { addPendingTransaction } from "@/lib/pendingTransactions";

export type TxType = "contribute" | "claim";
export type TxStatus = "idle" | "pending" | "success" | "error";

export interface TxFailure {
  reason: string;
  hash?: string;
  code?: string;
  attempt: number;
}

export interface TxAttempt {
  isRetry: boolean;
  attempt: number;
  fee: GasFeeEstimateData | null;
  previousFailure?: TxFailure;
}

interface TxConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TxType;
  circleName: string;
  amount: number; // USDT amount
  /**
   * Submits the actual on-chain transaction.
   * Should resolve with the tx hash on success, or throw on failure.
   */
  onConfirm: (attempt: TxAttempt) => Promise<string>;
  walletAddress?: string;
  estimateFee?: (request: GasFeeRequest) => Promise<GasFeeEstimateData | null>;
  onFailure?: (failure: TxFailure) => void;
  retryFailure?: TxFailure;
}

const EXPLORER_BASE_URL = "https://starkscan.co/tx";

export default function TxConfirmModal({
  isOpen,
  onClose,
  type,
  circleName,
  amount,
  onConfirm,
  walletAddress,
  estimateFee,
  onFailure,
  retryFailure,
}: TxConfirmModalProps) {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<TxFailure | null>(null);
  const attemptRef = useRef(0);
  const feeRequest = useMemo(() => ({ operation: type, walletAddress }), [type, walletAddress]);
  const { fee, loading: feeLoading, refresh } = useGasFeeEstimate(isOpen, feeRequest, estimateFee);

  useEffect(() => {
    if (isOpen) {
      const resetId = window.setTimeout(() => {
        setStatus("idle");
        setTxHash(null);
        setErrorMessage(null);
        setFailure(null);
        attemptRef.current = 0;
      }, 0);
      return () => window.clearTimeout(resetId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actionLabel = type === "contribute" ? "Make Contribution" : "Claim Reward";
  const actionVerb = type === "contribute" ? "contributing" : "claiming";

  const handleConfirm = async () => {
    if (status === "pending") return;
    const isRetry = status === "error" || Boolean(retryFailure);
    const attempt = attemptRef.current + 1;
    attemptRef.current = attempt;
    setStatus("pending");
    setErrorMessage(null);
    try {
      const latestFee = isRetry ? await refresh() : fee;
      const hash = await onConfirm({
        isRetry,
        attempt,
        fee: latestFee,
        previousFailure: failure ?? retryFailure,
      });
      setTxHash(hash);
      addPendingTransaction({
        hash,
        network: "starknet",
        label: type === "contribute" ? `Contribution to ${circleName}` : `Claim from ${circleName}`,
        amount: `${amount.toLocaleString()} USDT`,
      });
      setStatus("success");
    } catch (err) {
      const candidate = err as { message?: unknown; hash?: unknown; txHash?: unknown; code?: unknown };
      const nextFailure: TxFailure = {
        reason: typeof candidate.message === "string" ? candidate.message : "The wallet or network rejected the transaction.",
        hash: typeof candidate.hash === "string" ? candidate.hash : typeof candidate.txHash === "string" ? candidate.txHash : undefined,
        code: typeof candidate.code === "string" ? candidate.code : undefined,
        attempt,
      };
      setFailure(nextFailure);
      setErrorMessage(nextFailure.reason);
      onFailure?.(nextFailure);
      setStatus("error");
    }
  };

  const handleClose = () => {
    if (status === "pending") return; // prevent closing mid-transaction
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-confirm-title"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--modal)] border border-[var(--ov-14)] p-6 shadow-xl font-sora"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="tx-confirm-title" className="text-lg font-semibold text-[var(--text)]">
            Confirm {actionLabel}
          </h2>
          {status !== "pending" && (
            <button
              onClick={handleClose}
              aria-label="Close"
              className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* IDLE / PENDING REVIEW STATE */}
        {(status === "idle" || status === "pending") && (
          <>
            <dl className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <dt className="text-[var(--muted)]">Action</dt>
                <dd className="font-medium text-[var(--text)]">{actionLabel}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[var(--muted)]">Circle</dt>
                <dd className="font-medium text-[var(--text)]">{circleName}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[var(--muted)]">Amount</dt>
                <dd className="font-medium text-[var(--text)]">{amount.toLocaleString()} USDT</dd>
              </div>
            </dl>
            <GasFeeEstimate fee={fee} loading={feeLoading} />

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={status === "pending"}
                className="flex-1 rounded-xl border border-[var(--ov-1a)] text-[var(--text)] py-2.5 font-medium hover:bg-[var(--ov-0a)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={status === "pending"}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#4ADE80] text-[#0A0A0A] py-2.5 font-semibold hover:bg-[#3fc873] transition-colors disabled:opacity-70"
              >
                {status === "pending" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="text-center py-2">
            <CheckCircle2 className="mx-auto mb-3 text-[var(--success)]" size={48} />
            <p className="font-medium text-[var(--text)] mb-1">
              {type === "contribute" ? "Contribution successful" : "Reward claimed"}
            </p>
            <p className="text-sm text-[var(--muted)] mb-4">
              Your {actionVerb} of {amount.toLocaleString()} USDT to {circleName} was confirmed.
            </p>
            {txHash && (
              <a
                href={`${EXPLORER_BASE_URL}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--success)] hover:underline text-sm"
              >
                View on Starkscan <ExternalLink size={14} />
              </a>
            )}
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-[#4ADE80] text-[#0A0A0A] py-2.5 font-semibold hover:bg-[#3fc873] transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="text-center py-2">
            <XCircle className="mx-auto mb-3 text-red-500" size={48} />
            <p className="font-medium text-[var(--text)] mb-1">Transaction failed</p>
            <p className="text-sm text-[var(--muted)] mb-2">{errorMessage}</p>
            {failure?.code && <p className="text-xs text-[var(--muted)] mb-2">Error code: {failure.code}</p>}
            {failure?.hash && (
              <a
                href={`${EXPLORER_BASE_URL}/${failure.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:underline mb-4"
              >
                View failed transaction {failure.hash.slice(0, 10)}... <ExternalLink size={14} />
              </a>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-[var(--ov-1a)] text-[var(--text)] py-2.5 font-medium hover:bg-[var(--ov-0a)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-[#4ADE80] text-[#0A0A0A] py-2.5 font-semibold hover:bg-[#3fc873] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}