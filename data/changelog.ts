/**
 * Public changelog entries, newest first. Add a new entry at the top to ship
 * release notes — no backend required.
 */
export type ChangelogCategory = "New" | "Improved" | "Fixed";

export interface ChangelogEntry {
  id: string;
  version: string;
  date: string; // ISO-8601 date
  title: string;
  categories: ChangelogCategory[];
  description: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "v1.6.0",
    version: "1.6.0",
    date: "2026-09-30",
    title: "Savings goals, monthly statements & invite controls",
    categories: ["New"],
    description:
      "Track personal savings goals linked to your circles, download monthly account statements, and manage invite link expiry and revocation.",
  },
  {
    id: "v1.5.0",
    version: "1.5.0",
    date: "2026-09-12",
    title: "Organizer audit log",
    categories: ["New", "Improved"],
    description: "Organizers can now review a full audit trail of changes made to their circles.",
  },
  {
    id: "v1.4.2",
    version: "1.4.2",
    date: "2026-08-28",
    title: "Export reliability fixes",
    categories: ["Fixed"],
    description: "CSV exports now escape formula characters and PDF exports no longer open blank pages in Safari.",
  },
  {
    id: "v1.4.0",
    version: "1.4.0",
    date: "2026-08-10",
    title: "Faster dashboard",
    categories: ["Improved"],
    description: "The dashboard loads widgets progressively and remembers your custom layout.",
  },
];

export const CHANGELOG_SEEN_KEY = "ahjoor_changelog_seen";

export function getLatestChangelogId(): string | undefined {
  return CHANGELOG[0]?.id;
}

export function hasUnseenChangelog(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CHANGELOG_SEEN_KEY) !== getLatestChangelogId();
  } catch {
    return false;
  }
}

export function markChangelogSeen(): void {
  try {
    const latest = getLatestChangelogId();
    if (latest) localStorage.setItem(CHANGELOG_SEEN_KEY, latest);
  } catch { /* ignore */ }
}
