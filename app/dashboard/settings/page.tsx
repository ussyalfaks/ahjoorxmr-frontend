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
import PasskeyManager from "@/components/settings/PasskeyManager";
import NotificationDigestPreferences from "@/components/settings/NotificationDigestPreferences";
import { OPEN_SHORTCUTS_EVENT } from "@/components/ui/ShortcutsModal";
import { Toggle } from "@/components/ui/Toggle";
import AccountDataExport from "@/components/settings/AccountDataExport";
import {
  defaultContactSharingSettings,
  saveContactSharingSettings,
  type ContactField,
  type ContactSharingSettings,
} from "@/lib/contactDirectory";

const STORAGE_KEY = "ahjoorxmr:settings";

interface StoredProfileSettings {
  displayName: string;
  contactSharing: ContactSharingSettings;
}

const defaultProfileSettings: StoredProfileSettings = {
  displayName: "",
  contactSharing: defaultContactSharingSettings,
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
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${fontSize === option.value
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
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${highContrast ? "bg-[#4B6B76]" : "bg-[var(--ov-1a)]"
            }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${highContrast ? "translate-x-5" : "translate-x-0"
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
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${storedEnabled ? "bg-[#4B6B76]" : "bg-[var(--ov-1a)]"
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${storedEnabled ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        {storedEnabled && (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[var(--muted)] mb-2">
              Inactivity timeout
            </label>
            <div className="flex flex-wrap gap-2">
              {AUTO_LOGOUT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMinutesChange(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${storedMinutes === option.value
                    ? "bg-[#4B6B76] text-white border-[#4B6B76]"
                    : "border-[var(--ov-10)] text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle size={20} aria-hidden="true" />
              <h3 className="text-sm font-bold text-[var(--text)]">Session expiring soon</h3>
            </div>
            <p className="text-xs text-[var(--muted)]">
              You will be signed out in {Math.ceil(timeRemaining / 1000)} seconds due to inactivity.
            </p>
            <button
              onClick={extendSession}
              className="w-full px-4 py-2 rounded-lg bg-[#4B6B76] text-white text-sm font-semibold"
            >
              Stay signed in
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam ?? "general");
  const [profile, setProfile] = useState<StoredProfileSettings>(defaultProfileSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({ ...defaultProfileSettings, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/dashboard/settings?tab=${tab}`);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    saveContactSharingSettings(profile.contactSharing);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "general", label: "General", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-sora text-[var(--text)]">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--ov-10)] pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                ? "bg-[#4B6B76] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-05)]"
                }`}
            >
              <Icon size={16} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "general" && (
        <div className="space-y-6">
          <section className="p-6 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] space-y-4">
            <h2 className="text-base font-bold font-sora text-[var(--text)] flex items-center gap-2">
              <User size={18} className="text-[#4B6B76]" aria-hidden="true" />
              <span>Profile</span>
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-2">
                Display name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg bg-[var(--modal)] border border-[var(--ov-10)] text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-2">
                Wallet address
              </label>
              <p className="text-sm font-mono text-[var(--text)]">
                {truncateAddress(null)}
              </p>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] space-y-4">
            <h2 className="text-base font-bold font-sora text-[var(--text)] flex items-center gap-2">
              <Palette size={18} className="text-[#4B6B76]" aria-hidden="true" />
              <span>Appearance</span>
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-semibold text-[var(--text)]">Theme</span>
                <span className="block text-xs text-[var(--muted)] mt-0.5">
                  Switch between light and dark mode
                </span>
              </div>
              <ThemeToggle />
            </div>
            <FontSizeControl />
            <HighContrastToggle />
          </section>

              {/* High Contrast Toggle */}
              <HighContrastToggle />
            </section>
          </div>
          <AccountDataExport />
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          <NotificationDigestPreferences />
          <EmailNotificationPreferences />
          <PushNotificationPreferences />
          <LowBalanceAlertSettings />
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <TwoFactorSetup />
          <PasskeyManager />
          <ActiveSessionsManager />
          <AutoLogoutSection />
        </div>
      )}

      {activeTab === "danger" && (
        <section className="p-6 rounded-2xl bg-[var(--content)] border border-red-500/30 space-y-4">
          <h2 className="text-base font-bold font-sora text-red-500 flex items-center gap-2">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            These actions are irreversible. Please proceed with caution.
          </p>
          <button className="px-4 py-2 rounded-lg border border-red-500/40 text-red-500 text-sm font-semibold hover:bg-red-500/10 transition-colors">
            Delete account
          </button>
        </section>
      )}

      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <HelpCircle size={14} aria-hidden="true" />
        <button
          onClick={() => window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT))}
          className="underline hover:text-[var(--text)]"
        >
          View keyboard shortcuts
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
