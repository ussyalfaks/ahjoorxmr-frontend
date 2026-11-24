/**
 * Shared types for the typed API client (lib/api).
 *
 * Response shapes are reused from `types/` (and, where the richest existing
 * model actually lives in a `data/*.ts` mock file, re-exported from there)
 * rather than redefined here — see the individual exports below for where
 * each one actually comes from.
 */
import type { DiscoverCircle } from "@/data/circles";
import type { ContributionRecord } from "@/types/contribution";
import type { PayoutRecord } from "@/types/payout";
import type { Notification } from "@/types/notification";

/**
 * The circle shape served by the API client. This is `DiscoverCircle` from
 * `data/circles.ts` (the richest existing circle model — it already covers
 * discovery + "my circles" + categories/privacy/penalties), not the
 * dashboard-widget-local `Circle` in `types/circle.ts`, which models a
 * different, UI-state-heavy shape (deadlines, button labels/variants) used
 * only by the dashboard's own hardcoded "active savings" demo data.
 */
export type ApiCircle = DiscoverCircle;
export type ApiContribution = ContributionRecord;
export type ApiPayout = PayoutRecord;
export type ApiNotification = Notification;

/** The contract both the mock adapter and the HTTP adapter implement. */
export interface ApiClient {
  getCircles(): Promise<ApiCircle[]>;
  getCircle(id: string): Promise<ApiCircle | null>;
  getContributions(): Promise<ApiContribution[]>;
  getPayouts(): Promise<ApiPayout[]>;
  getNotifications(): Promise<ApiNotification[]>;
}
