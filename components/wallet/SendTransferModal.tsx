"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, Send, X, XCircle } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { truncateAddress } from "@/contexts/WalletContext";
import { getContacts, isValidAddressFormat } from "@/lib/addressBook";
import type { AddressBookContact } from "@/types/addressBook";

interface SendTransferModalProps {
  open: boolean;
  onClose: () => void;
  fromAddress: string;
}

type Status = "idle" | "pending" | "success" | "error";

export default function SendTransferModal({ open, onClose, fromAddress }: SendTransferModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [contacts, setContacts] = useState<AddressBookContact[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setContacts(getContacts());
      setRecipient("");
      setAmount("");
      setStatus("idle");
      setError(null);
      setShowContacts(false);
    }
  }, [open]);

  const close = () => {
    if (status === "pending") return;
    onClose();
  };

  useFocusTrap(dialogRef, open, close);

  if (!open) return null;

  async function handleSend() {
    if (!isValidAddressFormat(recipient)) {
      setError("Enter a valid recipient address.");
      return;
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    setError(null);
    setStatus("pending");
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
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
                onClick={handleSend}
                disabled={status === "pending"}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#4ADE80] text-[#0A0A0A] py-2.5 font-semibold hover:bg-[#3fc873] transition-colors disabled:opacity-70"
              >
                {status === "pending" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send
                  </>
                )}
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
