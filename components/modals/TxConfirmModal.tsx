"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, ExternalLink, X } from "lucide-react";

export type TxType = "contribute" | "claim";
export type TxStatus = "idle" | "pending" | "success" | "error";

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
  onConfirm: () => Promise<string>;
  /** Placeholder gas estimate; replace with a real estimate when available */
  estimatedGasFee?: string;
}

const EXPLORER_BASE_URL = "https://starkscan.co/tx";

export default function TxConfirmModal({
  isOpen,
  onClose,
  type,
  circleName,
  amount,
  onConfirm,
  estimatedGasFee = "~0.0008 ETH",
}: TxConfirmModalProps) {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setTxHash(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actionLabel = type === "contribute" ? "Make Contribution" : "Claim Reward";
  const actionVerb = type === "contribute" ? "contributing" : "claiming";

  const handleConfirm = async () => {
    setStatus("pending");
    setErrorMessage(null);
    try {
      const hash = await onConfirm();
      setTxHash(hash);
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
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
        className="w-full max-w-md rounded-2xl bg-[#1C1C1E] border border-[#ffffff14] p-6 shadow-xl font-sora"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="tx-confirm-title" className="text-lg font-semibold text-white">
            Confirm {actionLabel}
          </h2>
          {status !== "pending" && (
            <button
              onClick={handleClose}
              aria-label="Close"
              className="text-[#A1A1AA] hover:text-white transition-colors"
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
                <dt className="text-[#A1A1AA]">Action</dt>
                <dd className="font-medium text-white">{actionLabel}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#A1A1AA]">Circle</dt>
                <dd className="font-medium text-white">{circleName}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#A1A1AA]">Amount</dt>
                <dd className="font-medium text-white">{amount.toLocaleString()} USDT</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#A1A1AA]">Estimated gas fee</dt>
                <dd className="font-medium text-white">{estimatedGasFee}</dd>
              </div>
            </dl>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={status === "pending"}
                className="flex-1 rounded-xl border border-[#ffffff1a] text-white py-2.5 font-medium hover:bg-[#ffffff0a] transition-colors disabled:opacity-50"
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
            <CheckCircle2 className="mx-auto mb-3 text-[#4ADE80]" size={48} />
            <p className="font-medium text-white mb-1">
              {type === "contribute" ? "Contribution successful" : "Reward claimed"}
            </p>
            <p className="text-sm text-[#A1A1AA] mb-4">
              Your {actionVerb} of {amount.toLocaleString()} USDT to {circleName} was confirmed.
            </p>
            {txHash && (
              <a
                href={`${EXPLORER_BASE_URL}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#4ADE80] hover:underline text-sm"
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
            <p className="font-medium text-white mb-1">Transaction failed</p>
            <p className="text-sm text-[#A1A1AA] mb-6">{errorMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-[#ffffff1a] text-white py-2.5 font-medium hover:bg-[#ffffff0a] transition-colors"
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