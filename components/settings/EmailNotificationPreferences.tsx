"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Mail,
  DollarSign,
  Shield,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Radio,
} from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";

const NOTIFICATIONS_STORAGE_KEY = "ahjoorxmr:notification-settings";

export interface GroupedNotificationSettings {
  // Contributions & Circles
  emailRoundCompletions: boolean;
  emailContributionReminders: boolean;
  emailMissedContributions: boolean;
  emailCircleStatusUpdates: boolean;

  // Payouts & Treasury
  emailPayoutConfirmations: boolean;
  emailUpcomingPayoutAlerts: boolean;
  emailEscrowReleases: boolean;

  // Disputes & Governance
  emailDisputeUpdates: boolean;
  emailGovernanceVotes: boolean;

  // Social & Referrals
  emailReferralActivity: boolean;
  emailAchievementUnlocks: boolean;

  // In-app mirrors
  inAppRoundCompletions: boolean;
  inAppContributionReminders: boolean;
  inAppMissedContributions: boolean;
  inAppPayoutConfirmations: boolean;
  inAppDisputeUpdates: boolean;
  inAppReferralActivity: boolean;

  // Reminder offsets & digest
  reminderOffsets: number[];
  emailFrequency: "instant" | "daily-digest" | "weekly-summary";
}

export const defaultNotificationSettings: GroupedNotificationSettings = {
  emailRoundCompletions: true,
  emailContributionReminders: true,
  emailMissedContributions: true,
  emailCircleStatusUpdates: true,

  emailPayoutConfirmations: true,
  emailUpcomingPayoutAlerts: true,
  emailEscrowReleases: true,

  emailDisputeUpdates: true,
  emailGovernanceVotes: false,

  emailReferralActivity: true,
  emailAchievementUnlocks: true,

  inAppRoundCompletions: true,
  inAppContributionReminders: true,
  inAppMissedContributions: true,
  inAppPayoutConfirmations: true,
  inAppDisputeUpdates: true,
  inAppReferralActivity: true,

  reminderOffsets: [3, 1],
  emailFrequency: "instant",
};

const reminderOptions = [
  { offset: 3, label: "3 days before", description: "Advance heads-up before the round deadline" },
  { offset: 1, label: "1 day before", description: "Urgent reminder the day before contribution is due" },
  { offset: 0, label: "On the day", description: "Day-of notice when round window is closing" },
];

export default function EmailNotificationPreferences() {
  const [settings, setSettings] = useState<GroupedNotificationSettings>(
    defaultNotificationSettings
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        setSettings({ ...defaultNotificationSettings, ...stored });
      }
    } catch {
      // ignore
    }
  }, []);

  const updateSetting = (key: keyof GroupedNotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateReminderOffset = (offset: number, checked: boolean) => {
    setSettings((prev) => {
      const offsets = checked
        ? [...prev.reminderOffsets, offset]
        : prev.reminderOffsets.filter((v) => v !== offset);
      return {
        ...prev,
        reminderOffsets: offsets.sort((a, b) => b - a),
      };
    });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(settings)
      );
      // Simulate network save if endpoint exists
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4B6B76]/15 text-[#4B6B76] flex items-center justify-center">
            <Mail size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold font-sora text-[var(--text)]">
              Email Notification Events
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Choose which circle milestones, payouts, and security events trigger email updates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 shadow-sm"
        >
          {saveStatus === "saving" ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save size={14} aria-hidden="true" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>

      {saveStatus === "success" && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-2 text-xs font-medium animate-fade-up">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>Your notification preferences have been successfully updated and saved.</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-2 text-xs font-medium animate-fade-up">
          <AlertCircle size={16} aria-hidden="true" />
          <span>Failed to save preferences. Please try again.</span>
        </div>
      )}

      {/* Group 1: Contributions & Circles */}
      <section className="p-5 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--ov-08)]">
          <Clock size={16} className="text-[#4B6B76]" aria-hidden="true" />
          <h4 className="text-sm font-bold font-sora text-[var(--text)]">
            Contributions & Rotating Rounds
          </h4>
        </div>

        <div className="divide-y divide-[var(--ov-08)]">
          <Toggle
            id="emailContributionReminders"
            label="Upcoming contribution reminders"
            checked={settings.emailContributionReminders}
            onChange={(v) => updateSetting("emailContributionReminders", v)}
          />
          <Toggle
            id="emailRoundCompletions"
            label="Round completion & rotation notices"
            checked={settings.emailRoundCompletions}
            onChange={(v) => updateSetting("emailRoundCompletions", v)}
          />
          <Toggle
            id="emailMissedContributions"
            label="Missed contributions & grace period alerts"
            checked={settings.emailMissedContributions}
            onChange={(v) => updateSetting("emailMissedContributions", v)}
          />
          <Toggle
            id="emailCircleStatusUpdates"
            label="Circle fill and activation status changes"
            checked={settings.emailCircleStatusUpdates}
            onChange={(v) => updateSetting("emailCircleStatusUpdates", v)}
          />
        </div>

        {/* Contribution Reminder Schedule Offsets */}
        {settings.emailContributionReminders && (
          <div className="mt-4 pt-4 border-t border-[var(--ov-08)]">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Reminder Schedule Timing
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {reminderOptions.map(({ offset, label, description }) => (
                <label
                  key={offset}
                  htmlFor={`reminder-setting-${offset}`}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--ov-10)] bg-[var(--ov-03)] hover:bg-[var(--ov-06)] cursor-pointer transition-colors has-[:checked]:border-[#4B6B76] has-[:checked]:bg-[#4B6B76]/5"
                >
                  <input
                    id={`reminder-setting-${offset}`}
                    type="checkbox"
                    checked={settings.reminderOffsets.includes(offset)}
                    onChange={(e) => updateReminderOffset(offset, e.target.checked)}
                    className="mt-0.5 rounded border-[var(--ov-1a)] text-[#4B6B76] focus:ring-[#4B6B76] w-3.5 h-3.5"
                  />
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text)]">
                      {label}
                    </span>
                    <span className="block text-[10px] text-[var(--muted)] mt-0.5">
                      {description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Group 2: Payouts & Treasury */}
      <section className="p-5 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--ov-08)]">
          <DollarSign size={16} className="text-emerald-500" aria-hidden="true" />
          <h4 className="text-sm font-bold font-sora text-[var(--text)]">
            Payouts & Treasury
          </h4>
        </div>

        <div className="divide-y divide-[var(--ov-08)]">
          <Toggle
            id="emailPayoutConfirmations"
            label="Payout confirmations & wallet deposit receipts"
            checked={settings.emailPayoutConfirmations}
            onChange={(v) => updateSetting("emailPayoutConfirmations", v)}
          />
          <Toggle
            id="emailUpcomingPayoutAlerts"
            label="Upcoming payout turn reminders"
            checked={settings.emailUpcomingPayoutAlerts}
            onChange={(v) => updateSetting("emailUpcomingPayoutAlerts", v)}
          />
          <Toggle
            id="emailEscrowReleases"
            label="Collateral return & escrow release confirmations"
            checked={settings.emailEscrowReleases}
            onChange={(v) => updateSetting("emailEscrowReleases", v)}
          />
        </div>
      </section>

      {/* Group 3: Disputes & Governance */}
      <section className="p-5 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--ov-08)]">
          <Shield size={16} className="text-amber-500" aria-hidden="true" />
          <h4 className="text-sm font-bold font-sora text-[var(--text)]">
            Disputes & Pool Governance
          </h4>
        </div>

        <div className="divide-y divide-[var(--ov-08)]">
          <Toggle
            id="emailDisputeUpdates"
            label="Dispute filed and arbitrator resolution updates"
            checked={settings.emailDisputeUpdates}
            onChange={(v) => updateSetting("emailDisputeUpdates", v)}
          />
          <Toggle
            id="emailGovernanceVotes"
            label="Circle organizer calls and parameter vote requests"
            checked={settings.emailGovernanceVotes}
            onChange={(v) => updateSetting("emailGovernanceVotes", v)}
          />
        </div>
      </section>

      {/* Group 4: Social & Referrals */}
      <section className="p-5 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--ov-08)]">
          <Users size={16} className="text-purple-400" aria-hidden="true" />
          <h4 className="text-sm font-bold font-sora text-[var(--text)]">
            Social, Referrals & Achievements
          </h4>
        </div>

        <div className="divide-y divide-[var(--ov-08)]">
          <Toggle
            id="emailReferralActivity"
            label="Referral bonuses earned and new referee circle joins"
            checked={settings.emailReferralActivity}
            onChange={(v) => updateSetting("emailReferralActivity", v)}
          />
          <Toggle
            id="emailAchievementUnlocks"
            label="Achievement milestone badges unlocked"
            checked={settings.emailAchievementUnlocks}
            onChange={(v) => updateSetting("emailAchievementUnlocks", v)}
          />
        </div>
      </section>

      {/* Group 5: Delivery Frequency */}
      <section className="p-5 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] space-y-3">
        <h4 className="text-sm font-bold font-sora text-[var(--text)]">
          Email Delivery Digest Frequency
        </h4>
        <p className="text-xs text-[var(--muted)]">
          Control whether emails are delivered instantly upon occurrence or bundled into a periodic summary.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {[
            {
              id: "instant",
              label: "Instant Real-Time",
              desc: "Immediate delivery for all enabled events",
            },
            {
              id: "daily-digest",
              label: "Daily Digest",
              desc: "One compiled morning email summarizing activities",
            },
            {
              id: "weekly-summary",
              label: "Weekly Summary",
              desc: "Consolidated weekend digest of pool status",
            },
          ].map((item) => (
            <label
              key={item.id}
              className={`p-3 rounded-xl border cursor-pointer transition-colors flex flex-col justify-between ${
                settings.emailFrequency === item.id
                  ? "border-[#4B6B76] bg-[#4B6B76]/10"
                  : "border-[var(--ov-10)] bg-[var(--ov-03)] hover:bg-[var(--ov-06)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--text)]">
                  {item.label}
                </span>
                <input
                  type="radio"
                  name="emailFrequency"
                  value={item.id}
                  checked={settings.emailFrequency === item.id}
                  onChange={() =>
                    setSettings((prev) => ({
                      ...prev,
                      emailFrequency: item.id as GroupedNotificationSettings["emailFrequency"],
                    }))
                  }
                  className="text-[#4B6B76] focus:ring-[#4B6B76]"
                />
              </div>
              <span className="text-[10px] text-[var(--muted)]">
                {item.desc}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Save Button Footer */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="px-6 py-2.5 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
          {saveStatus === "saving" ? "Saving..." : "Save Changes"}
        </button>
        {saveStatus === "success" && (
          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>Settings saved successfully.</span>
          </span>
        )}
      </div>
    </div>
  );
}
