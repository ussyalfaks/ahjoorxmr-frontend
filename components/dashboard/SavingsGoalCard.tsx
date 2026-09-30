"use client";

import type { ReactNode } from "react";
import { MOCK_CIRCLES } from "@/data/circles";
import { getGoalProgress, type SavingsGoal } from "@/lib/savingsGoals";

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function SavingsGoalCard({ goal, actions }: { goal: SavingsGoal; actions?: ReactNode }) {
  const p = getGoalProgress(goal);
  const circleNames = MOCK_CIRCLES.filter((c) => goal.circleIds.includes(c.id)).map((c) => c.name);

  return (
    <div className={`rounded-xl bg-[var(--content)] p-5 space-y-3 ${goal.archived ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold font-sora text-[var(--text)]">{goal.name}</h3>
          <p className="text-xs text-[var(--muted)]">
            Target {money(goal.targetAmount)} by {new Date(goal.targetDate).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            p.onTrack ? "bg-[#34D39915] text-[#34D399]" : "bg-[#F8717115] text-[#F87171]"
          }`}
        >
          {p.onTrack ? "On track" : "Behind"}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-[var(--ov-0a)] overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(p.percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${goal.name} progress`}
      >
        <div className="h-full bg-[#4B6B76]" style={{ width: `${p.percent}%` }} />
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-[var(--muted)]">
        <span>
          <span className="text-[var(--text)] font-medium">{money(p.saved)}</span> saved ({Math.round(p.percent)}%)
        </span>
        <span>Expected payouts {money(p.expectedPayouts)}</span>
        <span>Projected: {p.projectedDate ? p.projectedDate.toLocaleDateString() : "Not reachable with linked circles"}</span>
      </div>
      {circleNames.length > 0 && <p className="text-xs text-[var(--faint)]">Linked: {circleNames.join(", ")}</p>}
      {actions}
    </div>
  );
}
