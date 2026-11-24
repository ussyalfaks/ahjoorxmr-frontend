"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import SavingsGoalCard from "@/components/dashboard/SavingsGoalCard";
import { MOCK_CIRCLES } from "@/data/circles";
import {
  deleteGoal,
  getGoals,
  GOALS_UPDATED_EVENT,
  setGoalArchived,
  upsertGoal,
  type SavingsGoal,
} from "@/lib/savingsGoals";

interface Draft {
  id?: string;
  name: string;
  targetAmount: string;
  targetDate: string;
  circleIds: string[];
}

const EMPTY: Draft = { name: "", targetAmount: "", targetDate: "", circleIds: [] };
const input = "w-full bg-[var(--content)] text-[var(--text)] rounded-lg px-3 py-2";
const smallBtn = "text-xs px-3 py-1.5 rounded-lg bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--text)]";

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setGoals(getGoals());
    sync();
    window.addEventListener(GOALS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(GOALS_UPDATED_EVENT, sync);
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const targetAmount = parseFloat(draft.targetAmount);
    if (!draft.name.trim() || !(targetAmount > 0) || !draft.targetDate) return;
    upsertGoal({ id: draft.id, name: draft.name.trim(), targetAmount, targetDate: draft.targetDate, circleIds: draft.circleIds });
    setDraft(null);
  }

  function toggleCircle(id: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      circleIds: draft.circleIds.includes(id) ? draft.circleIds.filter((c) => c !== id) : [...draft.circleIds, id],
    });
  }

  const visible = goals.filter((g) => g.archived === showArchived);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-sora text-[var(--text)]">Savings goals</h1>
          <p className="text-sm text-[var(--muted)]">Link circles to personal goals and track your progress.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowArchived((v) => !v)} className={smallBtn}>
            {showArchived ? "Show active" : "Show archived"}
          </button>
          <button onClick={() => setDraft(EMPTY)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4B6B76] text-white text-sm font-medium">
            <Plus size={14} aria-hidden="true" /> New goal
          </button>
        </div>
      </div>

      {draft && (
        <form onSubmit={submit} className="rounded-xl bg-[var(--surface)] border border-[var(--ov-0f)] p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-[var(--muted)] space-y-1">
              <span>Name</span>
              <input required className={input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Rent" />
            </label>
            <label className="text-sm text-[var(--muted)] space-y-1">
              <span>Target amount ($)</span>
              <input required type="number" min={1} step="any" className={input} value={draft.targetAmount} onChange={(e) => setDraft({ ...draft, targetAmount: e.target.value })} />
            </label>
            <label className="text-sm text-[var(--muted)] space-y-1">
              <span>Target date</span>
              <input required type="date" className={input} value={draft.targetDate} onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })} />
            </label>
          </div>
          <fieldset>
            <legend className="text-sm text-[var(--muted)] mb-2">Linked circles</legend>
            <div className="flex flex-wrap gap-2">
              {MOCK_CIRCLES.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-[var(--text)] bg-[var(--content)] rounded-lg px-3 py-1.5">
                  <input type="checkbox" checked={draft.circleIds.includes(c.id)} onChange={() => toggleCircle(c.id)} />
                  {c.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-[#4B6B76] text-white text-sm font-medium">
              {draft.id ? "Save changes" : "Create goal"}
            </button>
            <button type="button" onClick={() => setDraft(null)} className={smallBtn}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{showArchived ? "No archived goals." : "No goals yet — create one to get started."}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((g) => (
            <SavingsGoalCard
              key={g.id}
              goal={g}
              actions={
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    className={smallBtn}
                    onClick={() =>
                      setDraft({ id: g.id, name: g.name, targetAmount: String(g.targetAmount), targetDate: g.targetDate, circleIds: g.circleIds })
                    }
                  >
                    Edit
                  </button>
                  <button className={smallBtn} onClick={() => setGoalArchived(g.id, !g.archived)}>
                    {g.archived ? "Unarchive" : "Archive"}
                  </button>
                  {confirmDelete === g.id ? (
                    <>
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white" onClick={() => deleteGoal(g.id)}>
                        Confirm delete
                      </button>
                      <button className={smallBtn} onClick={() => setConfirmDelete(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-[var(--ov-0a)]" onClick={() => setConfirmDelete(g.id)}>
                      Delete
                    </button>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
