"use client";

import { useRef, useState } from "react";
import { Bell, BellOff, BellRing, ShieldAlert, ExternalLink } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useFocusTrap } from "@/hooks/useFocusTrap";

// ---------------------------------------------------------------------------
// Explanation dialog shown before the native browser prompt fires
// ---------------------------------------------------------------------------
function PermissionExplainerDialog({
  onConfirm,
  onCancel,
  isRequesting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isRequesting: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true, onCancel);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="push-dialog-title"
        aria-describedby="push-dialog-desc"
        className="w-full max-w-sm rounded-2xl border border-[var(--ov-14)] p-6 shadow-2xl"
        style={{ background: "var(--modal)" }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent-soft)] mb-5 mx-auto">
          <BellRing size={22} className="text-[var(--accent)]" aria-hidden="true" />
        </div>

        <h2
          id="push-dialog-title"
          className="text-base font-semibold text-center text-[var(--text)] mb-2"
        >
          Enable push notifications?
        </h2>
        <p
          id="push-dialog-desc"
          className="text-sm text-center text-[var(--muted)] mb-6 leading-relaxed"
        >
          Ahjoor will ask for your browser's permission to send you
          notifications. We'll only send alerts for the categories you turn on —
          contribution reminders, payout alerts, and dispute updates.
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRequesting}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--modal)]"
          >
            {isRequesting ? "Requesting permission…" : "Allow notifications"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isRequesting}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-[var(--muted)] bg-[var(--ov-07)] hover:bg-[var(--ov-0f)] disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status banner shown when permission is denied or browser is unsupported
// ---------------------------------------------------------------------------
function UnsupportedBanner({ isDenied }: { isDenied: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 p-4 rounded-xl border border-[var(--ov-14)] bg-[var(--ov-05)]"
    >
      <ShieldAlert
        size={18}
        className="text-[var(--muted)] shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        {isDenied ? (
          <>
            <p className="text-sm font-medium text-[var(--text)]">
              Browser notifications are blocked
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              You've previously denied permission. To enable push notifications,
              update the site permissions in your browser settings and then
              return here.
            </p>
            <a
              href="https://support.google.com/chrome/answer/3220216"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#4B6B76] hover:underline mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
            >
              How to update permissions
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--text)]">
              Push notifications aren't supported
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Your current browser doesn't support push notifications. Try
              Chrome, Edge, Firefox, or Safari 16.4+.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
export default function PushNotificationPreferences() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isRequesting,
    prefs,
    requestPermission,
    unsubscribe,
    updatePref,
  } = usePushNotifications();

  const [showExplainer, setShowExplainer] = useState(false);

  // What state is the opt-in button in?
  const isGranted = permission === "granted";
  const isDenied = permission === "denied";
  const canRequest = isSupported && permission === "default";

  async function handleMainToggle(enabled: boolean) {
    if (!enabled) {
      await unsubscribe();
      return;
    }
    // Show the explainer before triggering the native prompt
    if (canRequest) {
      setShowExplainer(true);
    }
  }

  async function handleConfirmPermission() {
    setShowExplainer(false);
    await requestPermission();
  }

  function handleCancelExplainer() {
    setShowExplainer(false);
  }

  // The master toggle is "on" when we have permission and are subscribed
  const masterToggleChecked = isGranted && isSubscribed;

  // Preference toggles are only interactive when push is active
  const prefsDisabled = !masterToggleChecked;

  return (
    <>
      {showExplainer && (
        <PermissionExplainerDialog
          onConfirm={handleConfirmPermission}
          onCancel={handleCancelExplainer}
          isRequesting={isRequesting}
        />
      )}

      <section
        aria-labelledby="push-notif-heading"
        className="rounded-lg border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--content)] p-5 lg:col-span-2"
      >
        {/* Section header */}
        <div className="flex items-center gap-2 mb-1">
          {isGranted && isSubscribed ? (
            <BellRing size={16} className="text-[var(--accent)] shrink-0" aria-hidden="true" />
          ) : (
            <Bell size={16} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
          )}
          <h2
            id="push-notif-heading"
            className="text-base font-semibold text-gray-900 dark:text-[var(--text)]"
          >
            Browser push notifications
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-[var(--muted)] mb-4 ml-6">
          Receive real-time alerts even when Ahjoor isn't open in your browser.
          Distinct from in-app notifications.
        </p>

        {/* Unsupported / denied banner */}
        {(!isSupported || isDenied) && (
          <div className="mb-4">
            <UnsupportedBanner isDenied={isDenied} />
          </div>
        )}

        {/* Master opt-in toggle */}
        <div className="rounded-xl border border-gray-100 dark:border-[var(--ov-0f)] bg-gray-50 dark:bg-[var(--ov-03)] px-4 py-1 mb-4">
          <Toggle
            id="push-master"
            label="Enable browser push notifications"
            description={
              isGranted && isSubscribed
                ? "You're opted in. Toggle off to unsubscribe."
                : isDenied
                ? "Permission was denied — update your browser settings to enable this."
                : !isSupported
                ? "Not available in this browser."
                : "Click to request permission from your browser."
            }
            checked={masterToggleChecked}
            onChange={handleMainToggle}
            disabled={!isSupported || isDenied || isRequesting}
          />
        </div>

        {/* Per-type preference toggles */}
        <div
          aria-label="Push notification type preferences"
          className={prefsDisabled ? "opacity-50 pointer-events-none select-none" : ""}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[var(--muted)] mb-1">
            Notify me about
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-[var(--border)]">
            <Toggle
              id="push-contribution-reminders"
              label="Contribution reminders"
              description="Alerts when your next contribution is due or overdue."
              checked={prefs.contributionReminders}
              onChange={(v) => updatePref("contributionReminders", v)}
              disabled={prefsDisabled}
            />
            <Toggle
              id="push-payout-alerts"
              label="Payout alerts"
              description="Notifications when a payout is ready to claim."
              checked={prefs.payoutAlerts}
              onChange={(v) => updatePref("payoutAlerts", v)}
              disabled={prefsDisabled}
            />
            <Toggle
              id="push-dispute-updates"
              label="Dispute updates"
              description="Updates on disputes in circles you participate in."
              checked={prefs.disputeUpdates}
              onChange={(v) => updatePref("disputeUpdates", v)}
              disabled={prefsDisabled}
            />
          </div>
        </div>

        {/* Granted + subscribed confirmation pill */}
        {isGranted && isSubscribed && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--success)] bg-[var(--success)]/10 rounded-full px-3 py-1"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"
              aria-hidden="true"
            />
            Push notifications active
          </div>
        )}
      </section>
    </>
  );
}
