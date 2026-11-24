"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, ShieldAlert, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getMockOrganizerAlerts, type CircleHealthAlert } from "@/lib/circleHealth";
import {
  CIRCLE_HEALTH_ALERTS_EVENT,
  SNOOZE_OPTIONS,
  dismissAlert,
  filterActiveAlerts,
  restoreAlert,
  snoozeAlert,
} from "@/lib/circleHealthAlerts";

const SEVERITY_STYLES: Record<CircleHealthAlert["severity"], { icon: typeof AlertTriangle; badge: string; label: string }> = {
  risk: { icon: ShieldAlert, badge: "bg-[var(--status-missed-bg)] text-[var(--status-missed)]", label: "At risk" },
  attention: { icon: AlertTriangle, badge: "bg-[var(--status-late-bg)] text-[var(--status-late)]", label: "Needs attention" },
};

const control =
  "rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--ov-0a)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]";

/** Organizer dashboard panel listing circles that are at risk. */
export default function CircleHealthAlertsPanel() {
  const { showToast } = useToast();
  const allAlerts = useMemo(() => getMockOrganizerAlerts(), []);
  const [alerts, setAlerts] = useState<CircleHealthAlert[]>([]);

  const sync = useCallback(() => setAlerts(filterActiveAlerts(allAlerts)), [allAlerts]);

  useEffect(() => {
    sync();
    // Re-check periodically so snoozed alerts reappear when the snooze ends.
    const interval = setInterval(sync, 60 * 1000);
    window.addEventListener(CIRCLE_HEALTH_ALERTS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener(CIRCLE_HEALTH_ALERTS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const handleDismiss = (alert: CircleHealthAlert) => {
    dismissAlert(alert);
    showToast({
      title: "Alert dismissed",
      message: `${alert.circleName}: ${alert.title}`,
      variant: "info",
      action: { label: "Undo", onClick: () => restoreAlert(alert.id) },
    });
  };

  const handleSnooze = (alert: CircleHealthAlert, value: string) => {
    const option = SNOOZE_OPTIONS.find((o) => o.label === value);
    if (!option) return;
    snoozeAlert(alert, option.ms);
    showToast({
      title: `Snoozed for ${option.label}`,
      message: `${alert.circleName}: ${alert.title}`,
      variant: "info",
      action: { label: "Undo", onClick: () => restoreAlert(alert.id) },
    });
  };

  return (
    <section aria-labelledby="circle-health-alerts-heading" className="bg-[var(--modal)] p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 id="circle-health-alerts-heading" className="text-lg font-bold font-sora text-[var(--text)]">
            Circle health alerts
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">Circles you organize that may need your attention.</p>
        </div>
        {alerts.length > 0 && (
          <span className="shrink-0 rounded-full bg-[var(--status-missed-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--status-missed)]">
            {alerts.length} active
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-[var(--content)] px-4 py-5 text-sm text-[var(--muted)]">
          <CheckCircle2 size={18} className="shrink-0 text-[var(--status-paid)]" aria-hidden="true" />
          All your circles look healthy. We&apos;ll flag late members, missed deadlines and leave requests here.
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const style = SEVERITY_STYLES[alert.severity];
            const Icon = style.icon;
            return (
              <li key={alert.id} className="rounded-xl bg-[var(--content)] p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.badge}`}>
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/circles/${alert.circleId}`}
                        className="font-semibold text-[var(--text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
                      >
                        {alert.circleName}
                      </Link>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>{style.label}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[var(--text)]">{alert.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{alert.detail}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={alert.action.href}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#4B6B76] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3D5A64] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2"
                      >
                        {alert.action.label}
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                      <select
                        value=""
                        onChange={(e) => handleSnooze(alert, e.target.value)}
                        aria-label={`Snooze alert for ${alert.circleName}`}
                        className={`${control} bg-transparent border border-[var(--ov-14)] cursor-pointer`}
                      >
                        <option value="" disabled>
                          Snooze…
                        </option>
                        {SNOOZE_OPTIONS.map((option) => (
                          <option key={option.label} value={option.label}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDismiss(alert)}
                        className={`${control} inline-flex items-center gap-1`}
                        aria-label={`Dismiss alert for ${alert.circleName}: ${alert.title}`}
                      >
                        <X size={13} aria-hidden="true" />
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
