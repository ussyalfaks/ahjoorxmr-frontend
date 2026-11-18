"use client";

import { safeStorage } from "@/lib/safeStorage";

import { useState, useEffect, useCallback } from "react";
import { SITE_ANNOUNCEMENTS } from "@/config/announcements";
import type { SiteAnnouncement, AnnouncementSeverity } from "@/types/siteAnnouncement";

const STORAGE_KEY = "ahjoor_dismissed_announcements";

/** Severity rank — higher number wins. */
const SEVERITY_RANK: Record<AnnouncementSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

/**
 * Picks the single active announcement with the highest severity from the
 * config, excluding any the user has already dismissed in this browser.
 */
export function useSiteAnnouncement() {
  // Default hidden to avoid hydration mismatch — resolved in useEffect.
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(safeStorage.getItem(STORAGE_KEY) ?? "[]");
      setDismissedIds(Array.isArray(stored) ? stored : []);
    } catch {
      setDismissedIds([]);
    }
    setHydrated(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage full or unavailable — fail silently.
      }
      return next;
    });
  }, []);

  /** The one banner to show, or null if none qualify. */
  const announcement: SiteAnnouncement | null = (() => {
    if (!hydrated) return null;
    const eligible = SITE_ANNOUNCEMENTS.filter(
      (a) => a.active && !dismissedIds.includes(a.id)
    );
    if (eligible.length === 0) return null;
    // Sort descending by severity; stable JS sort preserves list order for ties.
    return eligible.sort(
      (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
    )[0];
  })();

  return { announcement, dismiss };
}
