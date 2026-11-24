"use client";

import { PauseCircle } from "lucide-react";
import { useCirclePause } from "@/hooks/useCirclePause";

/** Tells every participant a circle is paused, and why. Renders nothing otherwise. */
export default function CirclePausedBanner({ circleId }: { circleId: string }) {
  const pause = useCirclePause(circleId);
  if (!pause.paused) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
    >
      <PauseCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
      <div>
        <p className="font-semibold text-[var(--text)]">This circle is paused</p>
        <p className="mt-0.5 text-[var(--muted)]">
          Contribution deadlines and reminders are on hold until the organizer resumes the circle.
          {pause.pausedAt && ` Paused ${new Date(pause.pausedAt).toLocaleDateString()}.`}
        </p>
        {pause.reason && (
          <p className="mt-2 text-[var(--text)]">
            <span className="text-[var(--muted)]">Reason:</span> {pause.reason}
          </p>
        )}
      </div>
    </div>
  );
}
