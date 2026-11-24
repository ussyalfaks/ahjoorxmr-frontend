/**
 * Platform-wide announcement banner types.
 *
 * Distinct from CircleAnnouncement (types/announcement.ts), which is
 * scoped to a single savings circle and sent by its organiser.
 * SiteAnnouncement is a platform-level mechanism, config-driven.
 */

export type AnnouncementSeverity = "info" | "warning" | "critical";

export interface SiteAnnouncement {
  /** Stable, unique identifier — used to remember per-announcement dismissals. */
  id: string;
  /** Short human-readable message shown in the banner. */
  message: string;
  severity: AnnouncementSeverity;
  /** Optional CTA link rendered next to the message. */
  link?: {
    label: string;
    href: string;
  };
  /** When false the entry is ignored even if it is listed in config. */
  active: boolean;
  /** ISO 8601 date string — informational only, not enforced client-side. */
  expiresAt?: string;
}
