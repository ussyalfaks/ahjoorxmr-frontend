import type { NotificationType } from "@/types/notification";

// Mirrors the storage key and shape used by hooks/usePushNotifications.ts.
const PUSH_PREFS_KEY = "ahjoor:push-prefs";

type PushPrefKey = "contributionReminders" | "payoutAlerts" | "disputeUpdates";

const TYPE_TO_PUSH_PREF: Partial<Record<NotificationType, PushPrefKey>> = {
  payout_ready: "payoutAlerts",
  your_turn: "payoutAlerts",
  missed_contribution: "contributionReminders",
};

function isPushCategoryEnabled(type: NotificationType): boolean {
  const key = TYPE_TO_PUSH_PREF[type];
  if (!key) return true;
  try {
    const prefs = JSON.parse(localStorage.getItem(PUSH_PREFS_KEY) ?? "{}") as Partial<Record<PushPrefKey, boolean>>;
    return prefs[key] !== false;
  } catch {
    return true;
  }
}

/** Short two-tone chime via Web Audio, so no audio asset is needed. */
export function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.2);
    });
    window.setTimeout(() => void ctx.close(), 600);
  } catch {
    // Autoplay policies may block audio before user interaction; non-fatal.
  }
}

/** Shows a system (push-style) notification if the user has granted permission. */
export function showBrowserNotification(type: NotificationType, title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted" || !isPushCategoryEnabled(type)) return;
  try {
    new Notification(title, { body, icon: "/favicon.ico", tag: `ahjoor-${type}` });
  } catch {
    // Some browsers (e.g. Android Chrome) only allow notifications via the service worker.
    navigator.serviceWorker?.ready
      .then((reg) => reg.showNotification(title, { body, icon: "/favicon.ico", tag: `ahjoor-${type}` }))
      .catch(() => {});
  }
}

/** Push + sound for a single notification. */
export function alertUser(type: NotificationType, title: string, body: string) {
  showBrowserNotification(type, title, body);
  playNotificationSound();
}
