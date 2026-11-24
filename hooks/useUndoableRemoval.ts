"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast, UNDO_TOAST_DURATION_MS } from "@/components/ui/Toast";

// #245: shared "soft delete, real delete after the undo window" behavior
// for destructive actions (dismissing a notification, removing a
// bookmark, deleting an address-book entry, ...). The item disappears
// from the UI immediately (so the action still feels instant), but the
// underlying `commit` callback — the thing that's actually hard to
// reverse, like dropping a row from an array passed up to a parent's
// state — only runs if the undo window (UNDO_TOAST_DURATION_MS, 5s) closes
// without the toast's "Undo" button being clicked.
export function useUndoableRemoval<Id extends string = string>() {
  const { showToast, dismissToast } = useToast();
  const [pendingIds, setPendingIds] = useState<Set<Id>>(new Set());
  const timers = useRef<Map<Id, ReturnType<typeof setTimeout>>>(new Map());
  const toastIds = useRef<Map<Id, string>>(new Map());

  const clearPending = useCallback((id: Id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    toastIds.current.delete(id);
    setPendingIds((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }, []);

  const undo = useCallback(
    (id: Id) => {
      const toastId = toastIds.current.get(id);
      if (toastId) dismissToast(toastId);
      clearPending(id);
    },
    [dismissToast, clearPending],
  );

  const remove = useCallback(
    (id: Id, options: { title: string; message?: string; commit: () => void }) => {
      setPendingIds((current) => new Set(current).add(id));

      const timer = setTimeout(() => {
        clearPending(id);
        options.commit();
      }, UNDO_TOAST_DURATION_MS);
      timers.current.set(id, timer);

      const toastId = showToast({
        title: options.title,
        message: options.message,
        variant: "info",
        durationMs: UNDO_TOAST_DURATION_MS,
        action: { label: "Undo", onClick: () => undo(id) },
      });
      toastIds.current.set(id, toastId);
    },
    [showToast, undo, clearPending],
  );

  // Flush any still-pending commits if the component unmounts mid-window
  // (e.g. navigating away) rather than silently dropping them.
  useEffect(() => {
    const timerMap = timers.current;
    return () => {
      timerMap.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const isPending = useCallback((id: Id) => pendingIds.has(id), [pendingIds]);

  return { remove, undo, isPending, pendingIds };
}
