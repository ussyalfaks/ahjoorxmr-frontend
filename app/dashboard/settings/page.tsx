"use client";

import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/Toggle";

// --- Wallet address source: swap for your actual hook ---
// import { useAccount } from "wagmi";
// import { useWallet } from "@/context/WalletContext";

const STORAGE_KEY = "ahjoorxmr:settings";

interface NotificationPrefs {
  emailRoundCompletions: boolean;
  emailPayoutReminders: boolean;
  emailMissedContributions: boolean;
  inAppRoundCompletions: boolean;
  inAppPayoutReminders: boolean;
  inAppMissedContributions: boolean;
}

interface StoredSettings {
  displayName: string;
  notifications: NotificationPrefs;
}

const defaultSettings: StoredSettings = {
  displayName: "",
  notifications: {
    emailRoundCompletions: true,
    emailPayoutReminders: true,
    emailMissedContributions: true,
    inAppRoundCompletions: true,
    inAppPayoutReminders: true,
    inAppMissedContributions: true,
  },
};

function truncateAddress(address?: string | null) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SettingsPage() {
  // Replace with your real connected address.
  const connectedAddress: string | null = null;

  const [settings, setSettings] = useState<StoredSettings>(defaultSettings);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveStatus, setLeaveStatus] = useState<"idle" | "leaving" | "done">(
    "idle"
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSettings({ ...defaultSettings, ...JSON.parse(raw) });
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  function updateNotification(key: keyof NotificationPrefs, value: boolean) {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  }

  async function handleSave() {
    setStatus("saving");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // If/when a backend endpoint exists, call it here instead/also:
      // await fetch("/api/settings", { method: "PUT", body: JSON.stringify(settings) });
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  async function handleLeaveAllCircles() {
    setLeaveStatus("leaving");
    try {
      await fetch("/api/circles/leave-all", { method: "POST" });
      setLeaveStatus("done");
    } catch {
      setLeaveStatus("idle");
    } finally {
      setShowLeaveConfirm(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your profile, notifications, and account.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile section */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Profile</h2>

          <div className="mt-4 space-y-4">
            <div>
              <span className="block text-xs font-medium text-gray-500">
                Wallet address
              </span>
              <span className="mt-1 block font-mono text-sm text-gray-800">
                {truncateAddress(connectedAddress)}
              </span>
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="block text-xs font-medium text-gray-500"
              >
                Display name (optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={settings.displayName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="How others see you in your circles"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Notification preferences */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Notifications
          </h2>

          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Email
            </h3>
            <div className="divide-y divide-gray-100">
              <Toggle
                id="emailRoundCompletions"
                label="Round completions"
                checked={settings.notifications.emailRoundCompletions}
                onChange={(v) => updateNotification("emailRoundCompletions", v)}
              />
              <Toggle
                id="emailPayoutReminders"
                label="Payout reminders"
                checked={settings.notifications.emailPayoutReminders}
                onChange={(v) => updateNotification("emailPayoutReminders", v)}
              />
              <Toggle
                id="emailMissedContributions"
                label="Missed contributions"
                checked={settings.notifications.emailMissedContributions}
                onChange={(v) =>
                  updateNotification("emailMissedContributions", v)
                }
              />
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              In-app
            </h3>
            <div className="divide-y divide-gray-100">
              <Toggle
                id="inAppRoundCompletions"
                label="Round completions"
                checked={settings.notifications.inAppRoundCompletions}
                onChange={(v) => updateNotification("inAppRoundCompletions", v)}
              />
              <Toggle
                id="inAppPayoutReminders"
                label="Payout reminders"
                checked={settings.notifications.inAppPayoutReminders}
                onChange={(v) => updateNotification("inAppPayoutReminders", v)}
              />
              <Toggle
                id="inAppMissedContributions"
                label="Missed contributions"
                checked={settings.notifications.inAppMissedContributions}
                onChange={(v) =>
                  updateNotification("inAppMissedContributions", v)
                }
              />
            </div>
          </div>
        </section>
      </div>

      {/* Save */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Save changes"}
        </button>
        {status === "success" && (
          <span className="text-sm text-green-600">Settings saved.</span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600">
            Something went wrong. Try again.
          </span>
        )}
      </div>

      {/* Danger zone */}
      <section className="mt-10 rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="text-base font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-red-700">
          Leaving all circles removes you from every active circle you've
          joined. Contributions already made are not refunded automatically;
          any pending payouts follow the circle's normal payout rules.
        </p>

        {leaveStatus === "done" ? (
          <p className="mt-3 text-sm font-medium text-red-800">
            You've left all circles.
          </p>
        ) : showLeaveConfirm ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-red-800">Are you sure?</span>
            <button
              type="button"
              disabled={leaveStatus === "leaving"}
              onClick={handleLeaveAllCircles}
              className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
            >
              {leaveStatus === "leaving" ? "Leaving..." : "Yes, leave all circles"}
            </button>
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(false)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Leave all circles
          </button>
        )}
      </section>
    </div>
  );
}