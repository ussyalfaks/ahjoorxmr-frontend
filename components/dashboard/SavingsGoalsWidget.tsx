"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import SavingsGoalCard from "@/components/dashboard/SavingsGoalCard";
import { getGoals, GOALS_UPDATED_EVENT, type SavingsGoal } from "@/lib/savingsGoals";

export default function SavingsGoalsWidget() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    const sync = () => setGoals(getGoals().filter((g) => !g.archived));
    sync();
    window.addEventListener(GOALS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(GOALS_UPDATED_EVENT, sync);
  }, []);

  return (
    <section className="rounded-2xl bg-[var(--surface)] border border-[var(--ov-0f)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-sora text-[var(--text)] flex items-center gap-2">
          <Target size={18} aria-hidden="true" /> Savings goals
        </h2>
        <Link href="/dashboard/goals" className="text-sm text-[#4B6B76] hover:underline">
          {goals.length ? "Manage" : "Create a goal"}
        </Link>
      </div>
      {goals.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Set a goal like rent or school fees and link your circles to track progress.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.slice(0, 4).map((g) => (
            <SavingsGoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}
    </section>
  );
}
