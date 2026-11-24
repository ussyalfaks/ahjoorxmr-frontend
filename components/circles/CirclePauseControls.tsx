"use client";

import { useId, useState } from "react";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCirclePause } from "@/hooks/useCirclePause";
import { MIN_PAUSE_REASON_LENGTH, pauseCircle, resumeCircle } from "@/lib/circlePause";

interface CirclePauseControlsProps {
  circleId: string;
  circleName: string;
  actor: string;
  participants: string[];
  /** Only active circles can be paused. */
  canPause: boolean;
}

/** Organizer-only pause/resume panel for the circle settings page. */
export default function CirclePauseControls({
  circleId,
  circleName,
  actor,
  participants,
  canPause,
}: CirclePauseControlsProps) {
  const { showToast } = useToast();
  const pause = useCirclePause(circleId);
  const reasonId = useId();
  const errorId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmingResume, setConfirmingResume] = useState(false);

  const handlePause = () => {
    try {
      pauseCircle({ circleId, circleName, reason, actor, participants });
      setReason("");
      setError(null);
      showToast({
        title: "Circle paused",
        message: `Deadlines and reminders are suspended. ${participants.length} participants were notified.`,
        variant: "warning",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not pause the circle.");
    }
  };

  const handleResume = () => {
    resumeCircle({ circleId, circleName, actor, participants });
    setConfirmingResume(false);
    showToast({
      title: "Circle resumed",
      message: "The contribution schedule has restarted and all participants were notified.",
      variant: "success",
    });
  };

  return (
    <section className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold font-sora text-[var(--text)]">Pause Circle</h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          For emergencies only. Pausing suspends contribution deadlines and reminders for everyone
          until you resume. Deadlines are extended by however long the circle stays paused.
        </p>
      </div>

      {pause.paused ? (
        <div className="space-y-4">
          <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium text-[var(--text)]">
              <PauseCircle size={16} className="text-amber-400" aria-hidden="true" />
              Paused since {pause.pausedAt ? new Date(pause.pausedAt).toLocaleString() : "—"}
            </p>
            {pause.reason && <p className="mt-1 text-[var(--muted)]">Reason: {pause.reason}</p>}
          </div>

          {confirmingResume ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-[var(--text)]">Restart the schedule and notify all participants?</p>
              <button
                type="button"
                onClick={handleResume}
                className="rounded-lg bg-[#4B6B76] px-4 py-2 text-sm font-medium text-white hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                Yes, resume
              </button>
              <button
                type="button"
                onClick={() => setConfirmingResume(false)}
                className="rounded-lg border border-[var(--ov-1a)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--ov-0a)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingResume(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4B6B76] px-4 py-2 text-sm font-medium text-white hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              <PlayCircle size={16} aria-hidden="true" />
              Resume circle
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor={reasonId} className="block text-xs text-[var(--muted)] mb-1.5">
              Reason for pausing (shown to all participants)
            </label>
            <textarea
              id={reasonId}
              rows={3}
              value={reason}
              disabled={!canPause}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              placeholder="e.g. Organizer family emergency — we'll resume next week."
              className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76] disabled:opacity-50"
            />
            {error && (
              <p id={errorId} role="alert" className="mt-1 text-xs text-red-400">
                {error}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handlePause}
            disabled={!canPause || reason.trim().length < MIN_PAUSE_REASON_LENGTH}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/50 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <PauseCircle size={16} aria-hidden="true" />
            Pause circle
          </button>
          {!canPause && <p className="text-xs text-[var(--muted)]">Only active circles can be paused.</p>}
        </div>
      )}
    </section>
  );
}
