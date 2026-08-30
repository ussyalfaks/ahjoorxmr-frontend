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
  Type,
  Contrast,
} from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme, type FontSize } from "@/contexts/ThemeContext";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import PushNotificationPreferences from "@/components/settings/PushNotificationPreferences";
import LowBalanceAlertSettings from "@/components/wallet/LowBalanceAlert";
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

const FONT_SIZE_OPTIONS: { value: FontSize; label: string; size: string }[] = [
  { value: "sm", label: "Small", size: "14px" },
  { value: "md", label: "Default", size: "16px" },
  { value: "lg", label: "Large", size: "18px" },
  { value: "xl", label: "X-Large", size: "20px" },
];

function FontSizeControl() {
  const { fontSize, setFontSize } = useTheme();

  return (
    <div className="pt-4 border-t border-[var(--ov-10)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-[var(--muted)]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--text)]">Font Size</span>
        </div>
      </div>
      <div 
        className="flex gap-1.5 p-1 rounded-lg bg-[var(--modal)] border border-[var(--ov-10)]"
        role="radiogroup"
        aria-label="Select font size"
      >
        {FONT_SIZE_OPTIONS.map((option) => (
          <button
            key={option.value}
            role="radio"
            aria-checked={fontSize === option.value}
            onClick={() => setFontSize(option.value)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
              fontSize === option.value
                ? "bg-[#4B6B76] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-05)]"
            }`}
            style={{ fontSize: option.size }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function HighContrastToggle() {
  const { highContrast, setHighContrast, resolvedTheme } = useTheme();

  return (
    <div className="pt-4 border-t border-[var(--ov-10)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Contrast size={16} className="text-[var(--muted)]" aria-hidden="true" />
          <div>
            <span className="block text-sm font-semibold text-[var(--text)]">
              High Contrast
            </span>
            <span className="block text-xs text-[var(--muted)] mt-0.5">
              Enhances text visibility ({resolvedTheme === "dark" ? "dark" : "light"} mode)
            </span>
          </div>
        </div>
        <button
          onClick={() => setHighContrast(!highContrast)}
          role="switch"
          aria-checked={highContrast}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
            highContrast ? "bg-[#4B6B76]" : "bg-[var(--ov-1a)]"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
              highContrast ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

const AUTO_LOGOUT_STORAGE_KEY = "ahjoor-auto-logout";

const AUTO_LOGOUT_OPTIONS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
];

function AutoLogoutSection() {
  const [storedEnabled, setStoredEnabled] = useState(false);
  const [storedMinutes, setStoredMinutes] = useState(5);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTO_LOGOUT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStoredEnabled(parsed.enabled ?? false);
        setStoredMinutes(parsed.minutes ?? 5);
      }
    } catch {
      // ignore
    }
  }, []);

  const {
    showWarning,
    timeRemaining,
    setEnabled,
    setTimeoutMinutes,
    extendSession,
    isIdle,
  } = useIdleTimer({
    enabled: storedEnabled,
    timeout: storedMinutes * 60 * 1000,
    warningTime: 60 * 1000,
    onIdle: () => {
      // Trigger logout - in a real app, this would clear auth and redirect
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "/";
    },
  });

  const handleEnableChange = (enabled: boolean) => {
    setStoredEnabled(enabled);
    setEnabled(enabled);
    localStorage.setItem(
      AUTO_LOGOUT_STORAGE_KEY,
      JSON.stringify({ enabled, minutes: storedMinutes })
    );
  };

  const handleMinutesChange = (minutes: number) => {
    setStoredMinutes(minutes);
    setTimeoutMinutes(minutes);
    localStorage.setItem(
      AUTO_LOGOUT_STORAGE_KEY,
      JSON.stringify({ enabled: storedEnabled, minutes })
    );
  };

  return (
    <>
      <section className="p-6 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] space-y-4">
        <h2 className="text-base font-bold font-sora text-[var(--text)] flex items-center gap-2">
          <Shield size={18} className="text-[#4B6B76]" aria-hidden="true" />
          <span>Auto-Logout Timer</span>
        </h2>

        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Automatically sign out after a period of inactivity to protect your account.
          A warning will appear 60 seconds before auto-logout.
        </p>

        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="block text-sm font-semibold text-[var(--text)]">
              Enable Auto-Logout
            </span>
            <span className="block text-xs text-[var(--muted)] mt-0.5">
              {storedEnabled ? "Active" : "Disabled"}
            </span>
          </div>
          <button
            onClick={() => handleEnableChange(!storedEnabled)}
            role="switch"
            aria-checked={storedEnabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
              storedEnabled ? "bg-[#4B6B76]" : "bg-[var(--ov-1a)]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                storedEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {storedEnabled && (
          <div className="pt-4 border-t border-[var(--ov-10)]">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Inactivity period
            </label>
            <div className="flex gap-2 flex-wrap">
              {AUTO_LOGOUT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMinutesChange(option.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                    storedMinutes === option.value
                      ? "bg-[#4B6B76] text-white"
                      : "bg-[var(--modal)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--ov-10)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Warning Modal */}
      <IdleWarningModal
        show={showWarning}
        timeRemaining={timeRemaining}
        onStaySignedIn={extendSession}
      />
    </>
  );
}

function IdleWarningModal({
  show,
  timeRemaining,
  onStaySignedIn,
}: {
  show: boolean;
  timeRemaining: number;
  onStaySignedIn: () => void;
}) {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (show && timeRemaining === 0) {
      setRedirecting(true);
    }
  }, [show, timeRemaining]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
      aria-describedby="idle-warning-desc"
    >
      <div className="bg-[var(--content)] p-8 rounded-2xl max-w-sm mx-4 shadow-2xl border border-[var(--ov-10)]">
        <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mb-5 mx-auto">
          <Shield size={28} className="text-amber-500" aria-hidden="true" />
        </div>
        
        <h3
          id="idle-warning-title"
          className="text-xl font-bold font-sora text-[var(--text)] text-center mb-3"
        >
          {redirecting ? "Signing out..." : "Session Expiring"}
        </h3>
        
        <p id="idle-warning-desc" className="text-sm text-[var(--muted)] text-center mb-6">
          {redirecting
            ? "You have been signed out due to inactivity."
            : `Your session will expire in ${timeRemaining} second${timeRemaining !== 1 ? "s" : ""} due to inactivity.`}
        </p>

        {redirecting ? (
          <div className="flex justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#4B6B76] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => {
                // This would navigate to logout - for now just close
                localStorage.removeItem(STORAGE_KEY);
                window.location.href = "/";
              }}
              className="flex-1 px-4 py-3 bg-[var(--ov-0a)] text-[var(--muted)] rounded-xl font-medium hover:bg-[var(--ov-14)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Sign Out
            </button>
            <button
              onClick={onStaySignedIn}
              className="flex-1 px-4 py-3 bg-[#4B6B76] text-white rounded-xl font-medium hover:bg-[#3D5A64] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Stay Signed In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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

              {/* Font Size Control */}
              <FontSizeControl />

              {/* High Contrast Toggle */}
              <HighContrastToggle />
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

          {/* Low Balance Alert Settings */}
          <LowBalanceAlertSettings />
        </div>
      )}

      {/* TAB 3: Security & Sessions */}
      {activeTab === "security" && (
        <div className="space-y-8 animate-fade-in">
          {/* Active Sessions & Connected Devices Manager */}
          <ActiveSessionsManager />

          {/* Two-Factor Authentication Setup */}
          <TwoFactorSetup accountLabel={connectedAddress ?? "wallet"} />

          {/* Auto-Logout Timer */}
          <AutoLogoutSection />
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