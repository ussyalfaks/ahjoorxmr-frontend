import type { CircleHealthAlert } from "@/lib/circleHealth";

const STORAGE_KEY = "ahjoor:circle-health-alerts";

export const CIRCLE_HEALTH_ALERTS_EVENT = "ahjoor:circle-health-alerts-changed";

export const SNOOZE_OPTIONS = [
  { label: "1 day", ms: 24 * 60 * 60 * 1000 },
  { label: "3 days", ms: 3 * 24 * 60 * 60 * 1000 },
  { label: "1 week", ms: 7 * 24 * 60 * 60 * 1000 },
] as const;

interface AlertPreference {
  /** Signature of the alert when it was dismissed or snoozed. */
  signature: string;
  dismissed?: boolean;
  snoozedUntil?: number; // epoch ms
}

type AlertPreferences = Record<string, AlertPreference>;

function readAll(): AlertPreferences {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(preferences: AlertPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new Event(CIRCLE_HEALTH_ALERTS_EVENT));
  } catch {
    // Storage may be unavailable (private mode); the alert just reappears.
  }
}

/**
 * Hides dismissed and still-snoozed alerts. A preference only applies while
 * the alert's signature is unchanged, so a worsening situation resurfaces.
 */
export function filterActiveAlerts(alerts: CircleHealthAlert[], now = Date.now()): CircleHealthAlert[] {
  const preferences = readAll();
  return alerts.filter((alert) => {
    const preference = preferences[alert.id];
    if (!preference || preference.signature !== alert.signature) return true;
    if (preference.dismissed) return false;
    return !(preference.snoozedUntil && preference.snoozedUntil > now);
  });
}

export function dismissAlert(alert: CircleHealthAlert) {
  writeAll({ ...readAll(), [alert.id]: { signature: alert.signature, dismissed: true } });
}

export function snoozeAlert(alert: CircleHealthAlert, durationMs: number, now = Date.now()) {
  writeAll({ ...readAll(), [alert.id]: { signature: alert.signature, snoozedUntil: now + durationMs } });
}

export function restoreAlert(alertId: string) {
  const preferences = readAll();
  delete preferences[alertId];
  writeAll(preferences);
}
