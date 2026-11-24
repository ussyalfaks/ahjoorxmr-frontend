import type { SiteAnnouncement } from "@/types/siteAnnouncement";

/**
 * Platform-wide announcement banners.
 *
 * Rules:
 *   - Only `active: true` entries are considered.
 *   - Only ONE banner is shown at a time; the one with the highest severity wins
 *     (critical > warning > info). Ties broken by list order (first wins).
 *   - Set `active: false` to silently retire an announcement while keeping
 *     the historical record in this file.
 *   - Each `id` must be globally unique so per-user dismissal state is stable.
 */
export const SITE_ANNOUNCEMENTS: SiteAnnouncement[] = [
  // ── Example: uncomment and edit to activate a banner ──────────────────────
  // {
  //   id: "maintenance-2026-10-01",
  //   severity: "warning",
  //   message:
  //     "Scheduled maintenance on 1 Oct 2026 from 02:00–04:00 UTC. Transactions may be delayed.",
  //   link: { label: "Learn more", href: "/help" },
  //   active: true,
  //   expiresAt: "2026-10-01T04:00:00Z",
  // },
  // {
  //   id: "feature-launch-v2",
  //   severity: "info",
  //   message: "Circle V2 is here — enjoy multi-currency payouts and instant settlements!",
  //   link: { label: "See what's new", href: "/help#changelog" },
  //   active: true,
  // },
  // {
  //   id: "incident-2026-09-25",
  //   severity: "critical",
  //   message: "We are investigating an issue affecting payout processing. Updates every 30 min.",
  //   link: { label: "Status page", href: "https://status.ahjoor.app" },
  //   active: true,
  // },
];
