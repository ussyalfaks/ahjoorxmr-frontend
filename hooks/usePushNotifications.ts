"use client";

import { useState, useEffect, useCallback } from "react";

export type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

export interface PushNotificationPrefs {
  contributionReminders: boolean;
  payoutAlerts: boolean;
  disputeUpdates: boolean;
}

const DEFAULT_PREFS: PushNotificationPrefs = {
  contributionReminders: true,
  payoutAlerts: true,
  disputeUpdates: true,
};

const STORAGE_KEY = "ahjoor:push-prefs";

function loadStoredPrefs(): PushNotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_PREFS;
}

function savePrefs(prefs: PushNotificationPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}

function getBrowserPermission(): PushPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as PushPermissionState;
}

/**
 * Stub: In production this would POST the PushSubscription to your backend.
 * For now we just log and resolve.
 */
async function sendSubscriptionToServer(subscription: PushSubscription | null): Promise<void> {
  // TODO: replace with real API call, e.g.:
  // await fetch("/api/push/subscribe", { method: "POST", body: JSON.stringify(subscription) });
  console.info("[push] subscription stub:", subscription?.endpoint ?? "unsubscribed");
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [prefs, setPrefsState] = useState<PushNotificationPrefs>(DEFAULT_PREFS);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Initialise from browser + localStorage on mount
  useEffect(() => {
    setPermission(getBrowserPermission());
    setPrefsState(loadStoredPrefs());

    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Sync subscription state with the service worker if available
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setIsSubscribed(!!sub))
        .catch(() => {
          // Non-fatal: service worker may not be ready yet
        });
    }
  }, []);

  /**
   * Request browser permission and (if granted) create a mock push subscription.
   * Returns the new permission state.
   */
  const requestPermission = useCallback(async (): Promise<PushPermissionState> => {
    if (!("Notification" in window)) return "unsupported";
    if (isRequesting) return permission;

    setIsRequesting(true);
    try {
      const result = await Notification.requestPermission();
      const next = result as PushPermissionState;
      setPermission(next);

      if (next === "granted") {
        // Attempt to create a push subscription via the service worker
        if ("serviceWorker" in navigator && "PushManager" in window) {
          try {
            const reg = await navigator.serviceWorker.ready;
            const existing = await reg.pushManager.getSubscription();
            const sub =
              existing ??
              (await reg.pushManager.subscribe({
                userVisibleOnly: true,
                // A real VAPID public key would go here:
                applicationServerKey: "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U",
              }).catch(() => null));
            setIsSubscribed(!!sub);
            await sendSubscriptionToServer(sub);
          } catch {
            // Subscription may fail (e.g., no VAPID key in dev) — treat as subscribed anyway
            setIsSubscribed(true);
            await sendSubscriptionToServer(null);
          }
        } else {
          // No service worker / PushManager (e.g., plain browser without PWA) — still mark opted-in
          setIsSubscribed(true);
          await sendSubscriptionToServer(null);
        }
      }

      return next;
    } finally {
      setIsRequesting(false);
    }
  }, [isRequesting, permission]);

  /** Revoke the push subscription and update state. */
  const unsubscribe = useCallback(async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      } catch {
        // Non-fatal
      }
    }
    setIsSubscribed(false);
    await sendSubscriptionToServer(null);
  }, []);

  /** Update a single preference key and persist. */
  const updatePref = useCallback(
    (key: keyof PushNotificationPrefs, value: boolean) => {
      setPrefsState((prev) => {
        const next = { ...prev, [key]: value };
        savePrefs(next);
        return next;
      });
    },
    []
  );

  return {
    /** Whether the browser supports push/Notification API */
    isSupported: permission !== "unsupported",
    permission,
    isSubscribed,
    isRequesting,
    prefs,
    requestPermission,
    unsubscribe,
    updatePref,
  };
}
