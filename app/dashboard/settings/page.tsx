"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Palette,
  AlertTriangle,
  HelpCircle,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PushNotificationPreferences from "@/components/settings/PushNotificationPreferences";
import TwoFactorSetup from "@/components/settings/TwoFactorSetup";
import EmailNotificationPreferences from "@/components/settings/EmailNotificationPreferences";
import ActiveSessionsManager from "@/components/settings/ActiveSessionsManager";
import { OPEN_SHORTCUTS_EVENT } from "@/components/ui/ShortcutsModal";

const STORAGE_KEY = "ahjoorxmr:settings";

interface StoredProfileSettings {
  displayName: string;
}

const defaultProfileSettings: StoredProfileSettings = {
  displayName: "",
};

function truncateAddress(address?: string | null) {
  if (!address) return "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type SettingsTab = "general" | "notifications" | "security" | "danger";

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || "general");

  const connectedAddress: string = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

  const [profile, setProfile] = useState<StoredProfileSettings>(defaultProfileSettings);
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveStatus, setLeaveStatus] = useState<"idle" | "leaving" | "done">(
    "idle"
  );

  useEffect(() => {
    if (tabParam && ["general", "notifications", "security", "danger"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if (stored.displayName !== undefined) {
          setProfile({ displayName: stored.displayName });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleTabChange = (t: SettingsTab) => {
    setActiveTab(t);
    router.push(`/dashboard/settings?tab=${t}`);
  };

  const openShortcuts = () => {
    window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT));
  };

  const handleSaveProfile = async () => {
    setProfileStatus("saving");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      await new Promise((resolve) => setTimeout(resolve, 400));
      setProfileStatus("success");
    } catch {
      setProfileStatus("error");
    } finally {
      setTimeout(() => setProfileStatus("idle"), 3000);
    }
  };

  const handleLeaveAllCircles = async () => {
    setLeaveStatus("leaving");
    try {
      await fetch("/api/circles/leave-all", { method: "POST" });
      setLeaveStatus("done");
    } catch {
      setLeaveStatus("idle");
    } finally {
      setShowLeaveConfirm(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sora text-[var(--text)]">Settings</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Manage your wallet profile, notification triggers, connected sessions, and security keys.
          </p>
        </div>
        <button
          type="button"
          onClick={openShortcuts}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--ov-14)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] self-start sm:self-auto"
        >
          <HelpCircle size={14} aria-hidden="true" />
          <span>Keyboard shortcuts</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        className="flex items-center gap-1.5 border-b border-[var(--ov-10)] overflow-x-auto scrollbar-none pb-px"
        role="tablist"
        aria-label="Settings sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "general"}
          onClick={() => handleTabChange("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap focus-visible:outline-none ${
            activeTab === "general"
              ? "text-[var(--text)] border-[#4B6B76] bg-[var(--ov-05)]"
              : "text-[var(--muted)] hover:text-[var(--text)] border-transparent hover:bg-[var(--ov-03)]"
          }`}
        >
          <User size={15} aria-hidden="true" />
          <span>Profile & Appearance</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "notifications"}
          onClick={() => handleTabChange("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap focus-visible:outline-none ${
            activeTab === "notifications"
              ? "text-[var(--text)] border-[#4B6B76] bg-[var(--ov-05)]"
              : "text-[var(--muted)] hover:text-[var(--text)] border-transparent hover:bg-[var(--ov-03)]"
          }`}
        >
          <Bell size={15} aria-hidden="true" />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "security"}
          onClick={() => handleTabChange("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap focus-visible:outline-none ${
            activeTab === "security"
              ? "text-[var(--text)] border-[#4B6B76] bg-[var(--ov-05)]"
              : "text-[var(--muted)] hover:text-[var(--text)] border-transparent hover:bg-[var(--ov-03)]"
          }`}
        >
          <Shield size={15} aria-hidden="true" />
          <span>Security & Sessions</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "danger"}
          onClick={() => handleTabChange("danger")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap focus-visible:outline-none ${
            activeTab === "danger"
              ? "text-red-500 border-red-500 bg-red-500/5"
              : "text-[var(--muted)] hover:text-red-500 border-transparent hover:bg-red-500/5"
          }`}
        >
          <AlertTriangle size={15} aria-hidden="true" />
          <span>Danger Zone</span>
        </button>
      </div>

      {/* Tab Panels */}

      {/* TAB 1: General & Profile */}
      {activeTab === "general" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <section className="p-6 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] space-y-4">
              <h2 className="text-base font-bold font-sora text-[var(--text)] flex items-center gap-2">
                <User size={18} className="text-[#4B6B76]" aria-hidden="true" />
                <span>Profile Details</span>
              </h2>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Connected Wallet Address
                  </label>
                  <div className="p-3 rounded-xl bg-[var(--modal)] border border-[var(--ov-10)] font-mono text-xs text-[var(--text)] truncate">
                    {connectedAddress}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-xs font-medium text-[var(--muted)] mb-1"
                  >
                    Display Name (Optional)
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={profile.displayName}
                    onChange={(e) =>
                      setProfile({ displayName: e.target.value })
                    }
                    placeholder="e.g. Satoshi_Saver"
                    className="w-full h-10 px-3.5 rounded-xl bg-[var(--modal)] border border-[var(--ov-10)] text-xs text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] transition-colors"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    This is how other participants see you in circles and discussions.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileStatus === "saving"}
                    className="px-5 py-2 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {profileStatus === "saving" ? "Saving..." : "Save Profile"}
                  </button>
                  {profileStatus === "success" && (
                    <span className="text-xs text-emerald-500 font-medium">Profile saved.</span>
                  )}
                  {profileStatus === "error" && (
                    <span className="text-xs text-red-500 font-medium">Failed to save.</span>
                  )}
                </div>
              </div>
            </section>

            {/* Appearance Card */}
            <section className="p-6 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] space-y-4">
              <h2 className="text-base font-bold font-sora text-[var(--text)] flex items-center gap-2">
                <Palette size={18} className="text-[#4B6B76]" aria-hidden="true" />
                <span>Appearance & Theme</span>
              </h2>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-[var(--text)]">
                    Color Theme
                  </span>
                  <span className="block text-xs text-[var(--muted)] mt-0.5">
                    Light, dark, or automatic system match
                  </span>
                </div>
                <ThemeToggle />
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-8 animate-fade-in">
          {/* Email Notification Categorized Preferences */}
          <EmailNotificationPreferences />

          {/* Browser Push Preferences */}
          <PushNotificationPreferences />
        </div>
      )}

      {/* TAB 3: Security & Sessions */}
      {activeTab === "security" && (
        <div className="space-y-8 animate-fade-in">
          {/* Active Sessions & Connected Devices Manager */}
          <ActiveSessionsManager />

          {/* Two-Factor Authentication Setup */}
          <TwoFactorSetup accountLabel={connectedAddress ?? "wallet"} />
        </div>
      )}

      {/* TAB 4: Danger Zone */}
      {activeTab === "danger" && (
        <div className="space-y-6 animate-fade-in">
          <section className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle size={24} aria-hidden="true" />
              <h2 className="text-lg font-bold font-sora">
                Danger Zone
              </h2>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-2xl">
              Leaving all circles removes you from every active circle you&apos;ve joined. Contributions already made are not refunded automatically; any pending payouts follow each circle&apos;s normal settlement rules.
            </p>

            {leaveStatus === "done" ? (
              <p className="text-xs font-semibold text-emerald-500">
                You have successfully left all joined circles.
              </p>
            ) : showLeaveConfirm ? (
              <div className="p-4 rounded-xl bg-[var(--modal)] border border-red-500/30 space-y-3">
                <span className="block text-xs font-bold text-red-500">
                  Are you absolutely sure? This action cannot be undone.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={leaveStatus === "leaving"}
                    onClick={handleLeaveAllCircles}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {leaveStatus === "leaving" ? "Leaving..." : "Yes, Leave All Circles"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeaveConfirm(false)}
                    className="rounded-xl border border-[var(--ov-14)] bg-[var(--content)] px-4 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--ov-08)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(true)}
                className="mt-2 rounded-xl border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
              >
                Leave all circles
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}