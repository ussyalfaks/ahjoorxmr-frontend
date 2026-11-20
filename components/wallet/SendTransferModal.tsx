"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, X, XCircle } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { truncateAddress } from "@/contexts/WalletContext";
import { getContacts, isValidAddressFormat } from "@/lib/addressBook";
import type { AddressBookContact } from "@/types/addressBook";
import { isKnownExchangeAddress, validateMemo, type MemoType } from "@/lib/sendTransfer";

interface SendTransferModalProps {
  open: boolean;
  onClose: () => void;
  fromAddress: string;
  onSent: (transfer: { recipient: string; amount: number; memo?: string; memoType: MemoType }) => void;
}

type Status = "idle" | "review" | "pending" | "success" | "error";

export default function SendTransferModal({ open, onClose, fromAddress, onSent }: SendTransferModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [contacts] = useState<AddressBookContact[]>(() => getContacts());
  const [showContacts, setShowContacts] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [memoType, setMemoType] = useState<MemoType>("text");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (status === "pending") return;
    onClose();
  };

  useFocusTrap(dialogRef, open, close);

  if (!open) return null;

  function handleReview() {
    if (!isValidAddressFormat(recipient)) {
      setError("Enter a valid recipient address.");
      return;
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    const memoError = validateMemo(memo, memoType);
    if (memoError) {
      setError(memoError);
      return;
    }
    setError(null);
    setStatus("review");
  }

  async function handleSend() {
    setError(null);
    setStatus("pending");
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      onSent({ recipient: recipient.trim(), amount: Number(amount), memo: memo || undefined, memoType });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-transfer-title"
      onClick={close}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl bg-[var(--modal)] border border-[var(--ov-14)] p-6 shadow-xl font-sora"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="send-transfer-title" className="text-lg font-semibold text-[var(--text)]">
            Send Funds
          </h2>
          {status !== "pending" && (
            <button onClick={close} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--text)]">
              <X size={20} />
            </button>
          )}
        </div>

        {(status === "idle" || status === "pending") && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="send-recipient" className="block text-xs text-[var(--muted)]">
                  Recipient address
                </label>
                {contacts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowContacts((v) => !v)}
                    className="flex items-center gap-1 text-xs text-[#4B6B76] hover:underline"
                  >
                    Saved contacts <ChevronDown size={12} aria-hidden="true" />
                  </button>
                )}
              </div>
              {showContacts && (
                <div className="mb-2 max-h-40 overflow-y-auto rounded-xl border border-[var(--ov-14)] bg-[var(--ov-05)]">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => {
                        setRecipient(contact.address);
                        setShowContacts(false);
                      }}
                      className="w-full flex flex-col items-start px-3 py-2 text-left hover:bg-[var(--ov-0a)] transition-colors"
                    >
                      <span className="text-sm font-medium text-[var(--text)]">{contact.label}</span>
                      <span className="text-xs font-mono text-[var(--muted)]">
                        {truncateAddress(contact.address)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <input
                id="send-recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x…"
                disabled={status === "pending"}
                className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
              />
              {isKnownExchangeAddress(recipient, contacts) && !memo && (
                <p className="mt-1.5 text-xs text-amber-500" role="status">
                  This is a saved exchange address. A memo may be required to credit your deposit.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="send-amount" className="block text-xs text-[var(--muted)] mb-1.5">
                Amount (USDT)
              </label>
              <input
                id="send-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={status === "pending"}
                placeholder="0.00"
                className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="send-memo" className="block text-xs text-[var(--muted)]">
                  Memo <span className="text-[var(--faint)]">(optional)</span>
                </label>
                <label htmlFor="send-memo-type" className="sr-only">
                  Memo type
                </label>
                <select
                  id="send-memo-type"
                  value={memoType}
                  onChange={(e) => setMemoType(e.target.value as MemoType)}
                  disabled={status === "pending"}
                  className="rounded-lg border border-[var(--ov-14)] bg-[var(--ov-0a)] px-2 py-1 text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                >
                  <option value="text">Text</option>
                  <option value="id">ID</option>
                </select>
              </div>
              <input
                id="send-memo"
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                disabled={status === "pending"}
                maxLength={memoType === "text" ? 28 : 20}
                placeholder={memoType === "text" ? "Up to 28 bytes" : "Unsigned 64-bit number"}
                className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
              />
              {memoType === "text" && (
                <p className="mt-1 text-xs text-[var(--faint)]">Maximum 28 UTF-8 bytes.</p>
              )}
            </div>

            <p className="text-xs text-[var(--faint)]">
              From {truncateAddress(fromAddress)}
            </p>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                onClick={close}
                disabled={status === "pending"}
                className="flex-1 rounded-xl border border-[var(--ov-1a)] text-[var(--text)] py-2.5 font-medium hover:bg-[var(--ov-0a)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={status === "pending"}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#4ADE80] text-[#0A0A0A] py-2.5 font-semibold hover:bg-[#3fc873] transition-colors disabled:opacity-70"
              >
                {status === "pending" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending...
                  </>
                ) : (
                  "Review transfer"
                )}
              </button>
            </div>
          </div>
        )}

        {status === "review" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--text)]">Confirm transfer details</h3>
            <dl className="space-y-3 rounded-xl bg-[var(--ov-05)] p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Recipient</dt>
                <dd className="font-mono text-[var(--text)]">{truncateAddress(recipient.trim())}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Amount</dt>
                <dd className="font-medium text-[var(--text)]">{amount} USDT</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Memo</dt>
                <dd className="break-all text-right text-[var(--text)]">
                  {memo ? `${memo} (${memoType === "id" ? "ID" : "text"})` : "None"}
                </dd>
              </div>
            </dl>
            {isKnownExchangeAddress(recipient, contacts) && !memo && (
              <p className="text-xs text-amber-500" role="alert">
                You selected a saved exchange address without a memo. The exchange may not credit your deposit.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setStatus("idle")}
                className="flex-1 rounded-xl border border-[var(--ov-1a)] text-[var(--text)] py-2.5 font-medium hover:bg-[var(--ov-0a)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                className="flex-1 rounded-xl bg-[#4ADE80] text-[#0A0A0A] py-2.5 font-semibold hover:bg-[#3fc873] transition-colors"
              >
                Confirm &amp; send
              </button>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-2">
            <CheckCircle2 className="mx-auto mb-3 text-[var(--success)]" size={48} />
            <p className="font-medium text-[var(--text)] mb-1">Transfer sent</p>
            <p className="text-sm text-[var(--muted)] mb-6">
              {amount} USDT sent to {truncateAddress(recipient)}.
              {memo && <span className="block mt-2">Memo ({memoType}): {memo}</span>}
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-[#4ADE80] text-[#0A0A0A] py-2.5 font-semibold hover:bg-[#3fc873] transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-2">
            <XCircle className="mx-auto mb-3 text-red-500" size={48} />
            <p className="font-medium text-[var(--text)] mb-1">Transfer failed</p>
            <p className="text-sm text-[var(--muted)] mb-6">Something went wrong. Please try again.</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-[var(--ov-1a)] text-[var(--text)] py-2.5 font-medium hover:bg-[var(--ov-0a)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
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
