import type { AnnouncementPriority, CircleAnnouncement } from "@/types/announcement";

const STORAGE_KEY = "ahjoor:circle-announcements";

// Same-tab components (composer + activity feed) need a signal when a new
// announcement is saved — localStorage's own "storage" event only fires in
// *other* tabs, so we dispatch this ourselves.
export const ANNOUNCEMENTS_EVENT = "ahjoor:announcements-changed";

/** Minimum time between announcements for the same circle. */
export const ANNOUNCEMENT_COOLDOWN_MS = 10 * 60 * 1000;

/** Composer message length cap, enforced both in the UI and here. */
export const ANNOUNCEMENT_MAX_LENGTH = 280;

function getAll(): CircleAnnouncement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(items: CircleAnnouncement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(ANNOUNCEMENTS_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function getAnnouncementsForCircle(circleId: string): CircleAnnouncement[] {
  return getAll()
    .filter((a) => a.circleId === circleId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

/** Milliseconds until another announcement may be sent for this circle (0 if allowed now). */
export function getAnnouncementCooldownRemaining(circleId: string): number {
  const [latest] = getAnnouncementsForCircle(circleId);
  if (!latest) return 0;
  const elapsed = Date.now() - new Date(latest.sentAt).getTime();
  return Math.max(0, ANNOUNCEMENT_COOLDOWN_MS - elapsed);
}

export function addAnnouncement(input: {
  circleId: string;
  circleName: string;
  message: string;
  priority: AnnouncementPriority;
  sentBy: string;
}): CircleAnnouncement {
  const announcement: CircleAnnouncement = {
    id: `announcement-${Date.now()}`,
    ...input,
    message: input.message.trim().slice(0, ANNOUNCEMENT_MAX_LENGTH),
    sentAt: new Date().toISOString(),
  };
  saveAll([...getAll(), announcement]);
  return announcement;
}
