"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AlertTriangle, X, Bell, BellOff, ExternalLink } from "lucide-react";

export interface LowBalanceAlertProps {
  /** Current wallet balance */
  balance: number;
  /** Upcoming contribution amount */
  upcomingContribution?: number;
  /** Days until contribution is due */
  daysUntilContribution?: number;
  /** Callback to navigate to deposit/top-up flow */
  onNavigateToDeposit?: () => void;
  /** Test mode - bypass date checks */
  testMode?: boolean;
}

const LOW_BALANCE_STORAGE_KEY = "ahjoor-low-balance-settings";

interface LowBalanceSettings {
  enabled: boolean;
  customThreshold?: number;
  dismissedAlerts: string[]; // timestamps of dismissed alerts
}

const DEFAULT_SETTINGS: LowBalanceSettings = {
  enabled: true,
  customThreshold: undefined,
  dismissedAlerts: [],
};

/**
 * Low-balance alert banner that warns users when their balance is insufficient
 * for an upcoming contribution.
 */
export function useLowBalanceAlert(
  balance: number,
  upcomingContribution: number = 0,
  daysUntilContribution: number = 7,
  testMode: boolean = false
) {
  const [settings, setSettings] = useState<LowBalanceSettings>(DEFAULT_SETTINGS);
  const [showAlert, setShowAlert] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOW_BALANCE_STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  }, []);

  // Determine threshold (custom or auto-derived from contribution)
  const threshold = useMemo(() => {
    if (settings.customThreshold !== undefined && settings.customThreshold > 0) {
      return settings.customThreshold;
    }
    // Auto-derive: use upcoming contribution amount, default to $50 minimum
    return upcomingContribution > 0 ? upcomingContribution : 50;
  }, [settings.customThreshold, upcomingContribution]);

  // Check if alert should show
  useEffect(() => {
    if (!settings.enabled) {
      setShowAlert(false);
      return;
    }

    const isLowBalance = balance < threshold;
    const isDueSoon = testMode || daysUntilContribution <= 7;

    // Check if recently dismissed (within last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentlyDismissed = settings.dismissedAlerts.some(
      (ts) => parseInt(ts) > oneDayAgo
    );

    if (isLowBalance && isDueSoon && !recentlyDismissed) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [balance, threshold, daysUntilContribution, settings.enabled, settings.dismissedAlerts, testMode]);

  const dismissAlert = useCallback(() => {
    const newDismissed = [...settings.dismissedAlerts, Date.now().toString()];
    const newSettings = { ...settings, dismissedAlerts: newDismissed };
    setSettings(newSettings);
    setShowAlert(false);
    localStorage.setItem(LOW_BALANCE_STORAGE_KEY, JSON.stringify(newSettings));
  }, [settings]);

  const toggleEnabled = useCallback((enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    localStorage.setItem(LOW_BALANCE_STORAGE_KEY, JSON.stringify(newSettings));
  }, [settings]);

  const setCustomThreshold = useCallback((value: number | undefined) => {
    const newSettings = { ...settings, customThreshold: value };
    setSettings(newSettings);
    localStorage.setItem(LOW_BALANCE_STORAGE_KEY, JSON.stringify(newSettings));
  }, [settings]);

  return {
    showAlert,
    threshold,
    dismissAlert,
    isEnabled: settings.enabled,
    toggleEnabled,
    setCustomThreshold,
  };
}

/**
 * Low-balance alert banner component
 */
export function LowBalanceAlertBanner({
  balance,
  upcomingContribution = 50,
  daysUntilContribution = 7,
  onNavigateToDeposit,
  testMode = false,
}: LowBalanceAlertProps) {
  const {
    showAlert,
    threshold,
    dismissAlert,
  } = useLowBalanceAlert(balance, upcomingContribution, daysUntilContribution, testMode);

  if (!showAlert) return null;

  const deficit = threshold - balance;

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6"
      role="alert"
    >
      <AlertTriangle
        size={20}
        className="text-amber-500 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          Low Balance Warning
        </p>
        <p className="text-xs text-[var(--muted)] mt-1">
          Your balance (${balance.toFixed(2)}) is below the recommended threshold (${threshold}).
          {upcomingContribution > 0 && (
            <>
              {" "}A contribution of ${upcomingContribution} is due in {daysUntilContribution} day
              {daysUntilContribution !== 1 ? "s" : ""}.
            </>
          )}
        </p>
        {deficit > 0 && onNavigateToDeposit && (
          <button
            onClick={onNavigateToDeposit}
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <ExternalLink size={12} aria-hidden="true" />
            Top up now
          </button>
        )}
      </div>
      <button
        onClick={dismissAlert}
        className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-label="Dismiss warning"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/**
 * Settings component for low-balance alerts
 */
export function LowBalanceAlertSettings() {
  const [settings, setSettings] = useState<LowBalanceSettings>(DEFAULT_SETTINGS);
  const [customThreshold, setCustomThreshold] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOW_BALANCE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        if (parsed.customThreshold !== undefined) {
          setCustomThreshold(parsed.customThreshold.toString());
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggle = (enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    localStorage.setItem(LOW_BALANCE_STORAGE_KEY, JSON.stringify(newSettings));
  };

  const handleThresholdChange = (value: string) => {
    setCustomThreshold(value);
    const threshold = parseFloat(value);
    const newSettings = {
      ...settings,
      customThreshold: isNaN(threshold) || threshold <= 0 ? undefined : threshold,
    };
    setSettings(newSettings);
    localStorage.setItem(LOW_BALANCE_STORAGE_KEY, JSON.stringify(newSettings));
  };

  return (
    <div className="p-6 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)] space-y-4">
      <h3 className="text-base font-bold font-sora text-[var(--text)] flex items-center gap-2">
        <Bell size={18} className="text-[#4B6B76]" aria-hidden="true" />
        <span>Low Balance Alerts</span>
      </h3>

      <p className="text-xs text-[var(--muted)] leading-relaxed">
        Get notified when your wallet balance is too low to cover an upcoming contribution,
        so you never miss a deadline and incur penalties.
      </p>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {settings.enabled ? (
            <Bell size={16} className="text-[var(--muted)]" aria-hidden="true" />
          ) : (
            <BellOff size={16} className="text-[var(--muted)]" aria-hidden="true" />
          )}
          <span className="text-sm font-semibold text-[var(--text)]">
            Enable Alerts
          </span>
        </div>
        <button
          onClick={() => handleToggle(!settings.enabled)}
          role="switch"
          aria-checked={settings.enabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
            settings.enabled ? "bg-[#4B6B76]" : "bg-[var(--ov-1a)]"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
              settings.enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Custom Threshold */}
      {settings.enabled && (
        <div className="pt-4 border-t border-[var(--ov-10)]">
          <label
            htmlFor="lowBalanceThreshold"
            className="block text-sm font-semibold text-[var(--text)] mb-2"
          >
            Custom threshold (optional)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted)]">$</span>
            <input
              id="lowBalanceThreshold"
              type="number"
              min="0"
              step="1"
              value={customThreshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              placeholder="Auto-calculated"
              className="flex-1 h-10 px-3 rounded-xl bg-[var(--modal)] border border-[var(--ov-10)] text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] transition-colors"
            />
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-1.5">
            Leave empty to automatically calculate from your upcoming contribution amount.
          </p>
        </div>
      )}
    </div>
  );
}