"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { DND_SCHEDULE_EVENT, getDndSchedule, isWithinQuietHours } from "@/lib/doNotDisturb";
import { flushDndQueue, getDndQueueSize } from "@/lib/notifications";

const CHECK_INTERVAL_MS = 60_000;

/**
 * Headless watcher mounted in the dashboard layout. Once quiet hours end
 * (or DND is turned off), it delivers any notifications held back.
 */
export default function DndQueueFlusher() {
  const { showToast } = useToast();

  useEffect(() => {
    const check = () => {
      if (getDndQueueSize() === 0) return;
      if (isWithinQuietHours(getDndSchedule())) return;
      const delivered = flushDndQueue();
      if (delivered > 0) {
        showToast({
          title: "Do Not Disturb ended",
          message: `${delivered} notification${delivered === 1 ? "" : "s"} arrived while you were in quiet hours.`,
          variant: "info",
        });
      }
    };

    check();
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);
    const onVisible = () => document.visibilityState === "visible" && check();
    window.addEventListener(DND_SCHEDULE_EVENT, check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(DND_SCHEDULE_EVENT, check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [showToast]);

  return null;
}
