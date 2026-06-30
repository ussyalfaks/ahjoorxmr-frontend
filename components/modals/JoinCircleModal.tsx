"use client";

import { useState, useRef } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface JoinCircleData {
  id: string;
  name: string;
  contribution: string;
  duration: string;
  members: string[];
  totalSlots: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  circle: JoinCircleData | null;
  currentWallet: string;
}

export default function JoinCircleModal({ open, onClose, circle, currentWallet }: Props) {
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useFocusTrap(ref, open, handleClose);

  function handleClose() {
    setSuccess(false);
    onClose();
  }

  async function handleJoin() {
    setJoining(true);
    await new Promise((r) => setTimeout(r, 1200));
    setJoining(false);
    setSuccess(true);
  }

  if (!open || !circle) return null;

  const isMember = circle.members.includes(currentWallet);
  const isFull = circle.members.length >= circle.totalSlots;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        ref={ref}
        className="bg-[#1C1C1E] rounded-2xl w-full max-w-sm p-8 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-circle-title"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {isMember ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-[#4B6B76]/20 flex items-center justify-center mx-auto" aria-hidden="true">
              <CheckCircle2 size={28} className="text-[#4B6B76]" />
            </div>
            <h2 id="join-circle-title" className="text-xl font-bold font-sora text-white">
              Already a Member
            </h2>
            <p className="text-[#A1A1AA] text-sm">
              You&apos;re already in{" "}
              <span className="text-white font-medium">{circle.name}</span>.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-[#ffffff0a] hover:bg-[#ffffff14] text-white font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Close
            </button>
          </div>
        ) : success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto" aria-hidden="true">
              <CheckCircle2 size={28} className="text-green-400" />
            </div>
            <h2 id="join-circle-title" className="text-xl font-bold font-sora text-white">
              You&apos;re In!
            </h2>
            <p className="text-[#A1A1AA] text-sm">
              You&apos;ve successfully joined{" "}
              <span className="text-white font-medium">{circle.name}</span>.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 id="join-circle-title" className="text-xl font-bold font-sora text-white">
              Join {circle.name}
            </h2>
            <div className="bg-[#ffffff0a] rounded-xl p-4 space-y-3">
              {[
                { label: "Contribution", value: circle.contribution },
                { label: "Duration", value: circle.duration },
                { label: "Slots", value: `${circle.members.length} / ${circle.totalSlots}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
            {isFull ? (
              <p className="text-red-400 text-sm text-center">This circle is full.</p>
            ) : (
              <p className="text-[#A1A1AA] text-xs">
                By joining, you agree to contribute {circle.contribution} each round.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 bg-[#ffffff0a] hover:bg-[#ffffff14] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={joining || isFull}
                className="flex-1 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                {joining ? "Joining…" : "Confirm Join"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
