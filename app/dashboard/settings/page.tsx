"use client";

import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PushNotificationPreferences from "@/components/settings/PushNotificationPreferences";
import TwoFactorSetup from "@/components/settings/TwoFactorSetup";

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
  reminderOffsets: number[];
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
    reminderOffsets: [3, 1],
  },
};

const reminderOptions = [
  { offset: 3, label: "3 days before", description: "A heads-up before the deadline" },
  { offset: 1, label: "1 day before", description: "A reminder the day before" },
  { offset: 0, label: "On the day", description: "A reminder when the contribution is due" },
];

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

  function openShortcuts() {
    window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT));
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<StoredSettings>;
        const storedReminderOffsets = stored.notifications?.reminderOffsets;
        const reminderOffsets = Array.isArray(storedReminderOffsets)
          ? [...new Set(storedReminderOffsets.filter((offset) => [0, 1, 3].includes(offset)))]
          : defaultSettings.notifications.reminderOffsets;
        // Hydrate client-only preferences after the initial server render.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings({
          ...defaultSettings,
          ...stored,
          notifications: {
            ...defaultSettings.notifications,
            ...stored.notifications,
            reminderOffsets,
          },
        });
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

  function updateReminderOffset(offset: number, checked: boolean) {
    setSettings((prev) => {
      const offsets = checked
        ? [...prev.notifications.reminderOffsets, offset]
        : prev.notifications.reminderOffsets.filter((value) => value !== offset);

      return {
        ...prev,
        notifications: { ...prev.notifications, reminderOffsets: offsets.sort((a, b) => b - a) },
      };
    });
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
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-[var(--text)]">Settings</h1>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mt-1 text-sm text-gray-500 dark:text-[var(--muted)]">
          Manage your profile, notifications, and account.
        </p>
        <button type="button" onClick={openShortcuts} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-[var(--border)] dark:text-[var(--text)] dark:hover:bg-[var(--ov-0a)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"><span aria-hidden="true">?</span> Keyboard shortcuts</button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile section */}
        <section className="rounded-lg border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--content)] p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-[var(--text)]">Profile</h2>

          <div className="mt-4 space-y-4">
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-[var(--muted)]">
                Wallet address
              </span>
              <span className="mt-1 block font-mono text-sm text-gray-800 dark:text-[var(--text)]">
                {truncateAddress(connectedAddress)}
              </span>
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="block text-xs font-medium text-gray-500 dark:text-[var(--muted)]"
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
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-[var(--border)] dark:bg-[var(--modal)] dark:text-[var(--text)] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:placeholder:text-[var(--faint)]"
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-lg border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--content)] p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-[var(--text)]">Appearance</h2>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="block text-sm font-medium text-gray-800 dark:text-[var(--text)]">Theme</span>
              <span className="block text-xs text-gray-500 dark:text-[var(--muted)]">
                Light, dark, or match your system setting
              </span>
            </div>
            <ThemeToggle />
          </div>
        </section>

        {/* Notification preferences */}
        <section className="rounded-lg border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--content)] p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-[var(--text)]">
            Notifications
          </h2>

          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[var(--muted)]">
              Email
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-[var(--border)]">
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
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[var(--muted)]">
              In-app
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-[var(--border)]">
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

          <div className="mt-6 border-t border-gray-100 pt-5 dark:border-[var(--border)]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[var(--muted)]">
                Contribution reminders
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-[var(--muted)]">
                Choose when to be reminded about upcoming contributions. You can select more than one.
              </p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {reminderOptions.map(({ offset, label, description }) => (
                <label
                  key={offset}
                  htmlFor={`reminder-${offset}`}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 transition-colors hover:border-blue-400 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:border-[var(--border)] dark:hover:border-blue-400 dark:has-[:checked]:bg-blue-500/10"
                >
                  <input
                    id={`reminder-${offset}`}
                    type="checkbox"
                    checked={settings.notifications.reminderOffsets.includes(offset)}
                    onChange={(event) => updateReminderOffset(offset, event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-[var(--border)] dark:bg-[var(--modal)]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-800 dark:text-[var(--text)]">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500 dark:text-[var(--muted)]">
                      {description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Browser push notification opt-in & preferences */}
        <PushNotificationPreferences />

        {/* Two-factor authentication */}
        <TwoFactorSetup accountLabel={connectedAddress ?? "wallet"} />
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
          <span className="text-sm text-green-600 dark:text-green-400">Settings saved.</span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            Something went wrong. Try again.
          </span>
        )}
      </div>

      {/* Danger zone */}
      <section className="mt-10 rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-500/10 p-5">
        <h2 className="text-base font-semibold text-red-800 dark:text-red-300">Danger zone</h2>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
          Leaving all circles removes you from every active circle you&apos;ve
          joined. Contributions already made are not refunded automatically;
          any pending payouts follow the circle&apos;s normal payout rules.
        </p>

        {leaveStatus === "done" ? (
          <p className="mt-3 text-sm font-medium text-red-800 dark:text-red-300">
            You&apos;ve left all circles.
          </p>
        ) : showLeaveConfirm ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-red-800 dark:text-red-300">Are you sure?</span>
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
              className="rounded-md border border-gray-300 dark:border-[var(--border)] bg-white dark:bg-[var(--modal)] px-3 py-1.5 text-sm text-gray-700 dark:text-[var(--text)] hover:bg-gray-50 dark:hover:bg-[var(--ov-0a)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="mt-3 rounded-md border border-red-300 dark:border-red-800/60 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/15"
          >
            Leave all circles
          </button>
        )}
      </section>
    </div>
  );
}