"use client";

import { Users, DollarSign, Clock, Hourglass } from "lucide-react";
import CountdownTimer from "@/components/ui/CountdownTimer";
import RoundProgressBar from "@/components/ui/RoundProgressBar";
import type { Circle } from "@/types/circle";
import CircleHealthIndicator from "@/components/circles/CircleHealthIndicator";
import { getMockCircleHealth } from "@/lib/circleHealth";

interface Props {
  circle: Circle;
  onContribute: (circle: Circle) => void;
  onClaim: (circle: Circle) => void;
}

export default function SavingsCard({ circle, onContribute, onClaim }: Props) {
  const claimDisabled = circle.claimButtonVariant === "disabled";

  return (
    <div className="bg-[var(--content)] p-6 md:p-8 rounded-3xl">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[var(--text)] font-sora tracking-wide">{circle.name}</h3>
            <CircleHealthIndicator health={getMockCircleHealth(circle.id)} />
            {circle.isYourTurn && (
              <span className="px-2.5 py-1 text-[10px] font-medium bg-[var(--ov-1a)] text-[var(--text)] rounded-full uppercase tracking-wider">
                Your turn
              </span>
            )}
          </div>
          <p className="text-[var(--muted)] text-xs ml-6">Created by {circle.creator}</p>
        </div>
        <CountdownTimer deadline={circle.deadline ?? null} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div>
          <p className="text-[var(--muted)] text-sm font-medium mb-2">Members</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--ov-0f)] flex items-center justify-center shrink-0">
              <Users size={16} className="text-[var(--muted)]" aria-hidden="true" />
            </div>
            <span className="text-xl font-semibold text-[var(--text)]">{circle.members}</span>
          </div>
        </div>
        <div>
          <p className="text-[var(--muted)] text-sm font-medium mb-2">Contributions</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--ov-0f)] flex items-center justify-center shrink-0">
              <DollarSign size={16} className="text-[var(--muted)]" aria-hidden="true" />
            </div>
            <span className="text-xl font-semibold text-[var(--text)]">{circle.contribution}</span>
          </div>
        </div>
        <div>
          <p className="text-[var(--muted)] text-sm font-medium mb-2">Duration</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--ov-0f)] flex items-center justify-center shrink-0">
              <Clock size={16} className="text-[var(--muted)]" aria-hidden="true" />
            </div>
            <span className="text-xl font-semibold text-[var(--text)]">{circle.duration}</span>
          </div>
        </div>
        <div>
          <p className="text-[var(--muted)] text-sm font-medium mb-2">Current Rounds</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--ov-0f)] flex items-center justify-center shrink-0">
              <Hourglass size={16} className="text-[var(--muted)]" aria-hidden="true" />
            </div>
            <span className="text-xl font-semibold text-[var(--text)]">
              {circle.currentRound}/{circle.totalRounds}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <RoundProgressBar current={circle.currentRound} total={circle.totalRounds} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-[var(--ov-0f)] shrink-0">
        <button
          type="button"
          onClick={() => onContribute(circle)}
          className="flex-1 sm:flex-none px-6 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--content)]"
        >
          {circle.contributionButtonLabel}
        </button>
        <button
          type="button"
          onClick={() => !claimDisabled && onClaim(circle)}
          disabled={claimDisabled}
          aria-disabled={claimDisabled}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-lg transition-colors text-center ml-auto sm:ml-0 md:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--content)] ${
            claimDisabled ? "cursor-not-allowed" : ""
          } ${
            circle.claimButtonVariant === "primary"
              ? "bg-[#4B6B76] hover:bg-[#3D5A64] text-white"
              : circle.claimButtonVariant === "secondary"
              ? "bg-[#5E686A] hover:bg-[#4d5658] text-[var(--text)]"
              : "bg-[#78787B] text-[#E0E0E0]"
          }`}
        >
          Claim Reward
        </button>
      </div>
    </div>
  );
}