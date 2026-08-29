"use client";

import { useEffect, useRef, useState } from "react";
import { Dices, Lock, RotateCcw, Shuffle, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  generateSeed,
  getPayoutDraw,
  savePayoutDraw,
  seededShuffle,
  type PayoutDraw,
} from "@/lib/payoutDraw";

interface PayoutDrawModalProps {
  open: boolean;
  onClose: () => void;
  circleId: string;
  participantAddresses: string[];
  onDrawFinalized: (draw: PayoutDraw) => void;
}

function truncate(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

const REVEAL_TICKS = 14;
const TICK_MS = 140;

export default function PayoutDrawModal({
  open,
  onClose,
  circleId,
  participantAddresses,
  onDrawFinalized,
}: PayoutDrawModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "shuffling" | "done">("idle");
  const [displayOrder, setDisplayOrder] = useState<string[]>(participantAddresses);
  const [finalDraw, setFinalDraw] = useState<PayoutDraw | null>(null);

  useEffect(() => {
    if (open) {
      setPhase("idle");
      setDisplayOrder(participantAddresses);
      setFinalDraw(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    if (phase === "shuffling") return;
    onClose();
  };

  useFocusTrap(dialogRef, open, close);

  if (!open) return null;

  function runDraw() {
    setPhase("shuffling");
    const seed = generateSeed();
    const finalOrder = seededShuffle(participantAddresses, seed);

    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      if (tick < REVEAL_TICKS) {
        // Cosmetic intermediate permutations — the auditable result is `finalOrder`,
        // seeded above, not any of these random reveal frames.
        setDisplayOrder(seededShuffle(participantAddresses, `${seed}-${tick}`));
      } else {
        clearInterval(interval);
        setDisplayOrder(finalOrder);
        const draw: PayoutDraw = {
          circleId,
          order: finalOrder,
          seed,
          timestamp: new Date().toISOString(),
          locked: true,
        };
        savePayoutDraw(draw);
        setFinalDraw(draw);
        setPhase("done");
        onDrawFinalized(draw);
      }
    }, TICK_MS);
  }

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payout-draw-title"
      onClick={close}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl bg-[var(--modal)] border border-[var(--ov-14)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="payout-draw-title" className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
            <Dices size={20} aria-hidden="true" />
            Payout Order Draw
          </h2>
          {phase !== "shuffling" && (
            <button onClick={close} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--text)]">
              <X size={20} />
            </button>
          )}
        </div>

        {phase === "idle" && (
          <>
            <p className="text-sm text-[var(--muted)] mb-4">
              Randomly assigns each participant a payout round. The draw is seeded and
              timestamped so anyone can verify the result wasn&apos;t manipulated.
            </p>
            <ul className="space-y-1.5 mb-5">
              {participantAddresses.map((address, i) => (
                <li
                  key={address}
                  className="flex items-center justify-between rounded-lg bg-[var(--ov-05)] px-3 py-2 text-sm"
                >
                  <span className="text-[var(--faint)] text-xs">#{i + 1}</span>
                  <span className="font-mono text-[var(--text)]">{truncate(address)}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={runDraw}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white py-2.5 font-semibold transition-colors"
            >
              <Shuffle size={16} aria-hidden="true" />
              Run Payout Draw
            </button>
          </>
        )}

        {(phase === "shuffling" || phase === "done") && (
          <>
            <ul className="space-y-1.5 mb-5" aria-live={phase === "shuffling" ? "polite" : undefined}>
              {displayOrder.map((address, i) => (
                <li
                  key={address}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    phase === "done" ? "bg-[#4B6B76]/10" : "bg-[var(--ov-05)]"
                  }`}
                >
                  <span className="text-[var(--faint)] text-xs">Round {i + 1}</span>
                  <span className="font-mono text-[var(--text)]">{truncate(address)}</span>
                </li>
              ))}
            </ul>

            {phase === "shuffling" && (
              <p className="text-center text-sm text-[var(--muted)] animate-pulse">Shuffling…</p>
            )}

            {phase === "done" && finalDraw && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                  <Lock size={14} aria-hidden="true" />
                  Order locked
                </div>
                <dl className="space-y-1 rounded-lg bg-[var(--ov-05)] p-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--muted)]">Seed</dt>
                    <dd className="font-mono text-[var(--text)] truncate">{finalDraw.seed}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--muted)]">Timestamp</dt>
                    <dd className="text-[var(--text)]">{new Date(finalDraw.timestamp).toLocaleString()}</dd>
                  </div>
                </dl>
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white py-2.5 font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
