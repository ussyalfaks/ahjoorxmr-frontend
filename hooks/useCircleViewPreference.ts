"use client";

import { useCallback, useEffect, useState } from "react";

export type CircleView = "grid" | "list";

const STORAGE_KEY = "ahjoor:circles-view";
const DEFAULT_VIEW: CircleView = "grid";

function readStored(): CircleView {
  if (typeof window === "undefined") return DEFAULT_VIEW;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "grid" || raw === "list") return raw;
  } catch {
    // ignore storage errors
  }
  return DEFAULT_VIEW;
}

/**
 * Returns the active circle view preference and a stable setter.
 * The value is initialised from localStorage on mount and written back
 * whenever it changes.
 */
export function useCircleViewPreference() {
  // Start with the default to avoid a hydration mismatch, then sync from
  // storage in the effect below.
  const [view, setViewState] = useState<CircleView>(DEFAULT_VIEW);

  useEffect(() => {
    setViewState(readStored());
  }, []);

  const setView = useCallback((next: CircleView) => {
    setViewState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  return { view, setView };
}
