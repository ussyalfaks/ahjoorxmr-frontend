"use client";

import { useState } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Globe,
  Shield,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  X,
  Radio,
  Lock,
} from "lucide-react";
import { ActiveSession, DeviceType } from "@/types/session";
import { MOCK_SESSIONS } from "@/data/sessions";

const DEVICE_ICONS: Record<DeviceType, React.ElementType> = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
};

export default function ActiveSessionsManager() {
  const [sessions, setSessions] = useState<ActiveSession[]>(MOCK_SESSIONS);
  const [sessionToRevoke, setSessionToRevoke] = useState<ActiveSession | null>(null);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRevokeSingle = async () => {
    if (!sessionToRevoke) return;
    setRevoking(true);
    await new Promise((res) => setTimeout(res, 400));
    setSessions((prev) => prev.filter((s) => s.id !== sessionToRevoke.id));
    setRevoking(false);
    triggerToast(`Session for ${sessionToRevoke.deviceName} (${sessionToRevoke.location.city}) was revoked.`);
    setSessionToRevoke(null);
  };

  const handleRevokeAllOther = async () => {
    setRevoking(true);
    await new Promise((res) => setTimeout(res, 500));
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setRevoking(false);
    triggerToast("All other active sessions have been signed out.");
    setShowRevokeAllModal(false);
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-2 text-xs font-medium animate-fade-up"
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header card with action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--content)] border border-[var(--ov-10)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4B6B76]/15 text-[#4B6B76] flex items-center justify-center">
            <Shield size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold font-sora text-[var(--text)]">
              Connected Devices & Sessions
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Review browsers and mobile devices currently signed into your wallet account.
            </p>
          </div>
        </div>

        {otherSessionsCount > 0 && (
          <button
            type="button"
            onClick={() => setShowRevokeAllModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors shrink-0"
          >
            <LogOut size={14} aria-hidden="true" />
            <span>Sign Out All Other Sessions</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="p-5 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--ov-08)]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Active Devices ({sessions.length})
          </h4>
          <span className="text-[11px] text-[var(--muted)]">
            {otherSessionsCount} other {otherSessionsCount === 1 ? "device" : "devices"} connected
          </span>
        </div>

        <div className="divide-y divide-[var(--ov-08)]">
          {sessions.map((session) => {
            const Icon = DEVICE_ICONS[session.deviceType] || Monitor;
            return (
              <div
                key={session.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-2 last:pb-2"
              >
                {/* Device & Location Meta */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      session.isCurrent
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                        : "bg-[var(--ov-05)] border-[var(--ov-10)] text-[var(--muted)]"
                    }`}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold font-sora text-[var(--text)]">
                        {session.deviceName}
                      </span>
                      {session.isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          This Device (Current)
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--muted)] font-medium">
                          {session.lastActiveDisplay}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)] mt-1">
                      <span>{session.browser}</span>
                      <span>·</span>
                      <span>{session.os}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Globe size={11} aria-hidden="true" />
                        <span>
                          {session.location.city}, {session.location.country}
                        </span>
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[11px] text-[var(--faint)]">
                        {session.ipAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Revoke Action */}
                <div className="flex items-center justify-end">
                  {session.isCurrent ? (
                    <span className="text-xs text-[var(--muted)] px-3 py-1.5 rounded-lg bg-[var(--ov-05)]">
                      Current Session
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSessionToRevoke(session)}
                      className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal: Single Session Revoke */}
      {sessionToRevoke && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-modal-title"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-[var(--modal)] border border-[var(--ov-14)] shadow-2xl p-6 text-[var(--text)]">
            <button
              type="button"
              onClick={() => setSessionToRevoke(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Close"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <AlertTriangle size={24} aria-hidden="true" />
            </div>

            <h3 id="revoke-modal-title" className="text-lg font-bold font-sora">
              Revoke Session Access?
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1.5">
              Are you sure you want to sign out <strong>{sessionToRevoke.deviceName}</strong> ({sessionToRevoke.location.city}, {sessionToRevoke.location.country})? Any unconfirmed transactions on that device will be canceled.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSessionToRevoke(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-[var(--ov-10)] hover:bg-[var(--ov-08)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={revoking}
                onClick={handleRevokeSingle}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {revoking ? "Revoking..." : "Yes, Revoke Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Revoke All Other Sessions */}
      {showRevokeAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-all-modal-title"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-[var(--modal)] border border-[var(--ov-14)] shadow-2xl p-6 text-[var(--text)]">
            <button
              type="button"
              onClick={() => setShowRevokeAllModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Close"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <LogOut size={24} aria-hidden="true" />
            </div>

            <h3 id="revoke-all-modal-title" className="text-lg font-bold font-sora">
              Sign Out All Other Sessions?
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1.5">
              This will immediately invalidate session tokens across all {otherSessionsCount} other connected devices. You will stay signed in on this device.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowRevokeAllModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-[var(--ov-10)] hover:bg-[var(--ov-08)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={revoking}
                onClick={handleRevokeAllOther}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {revoking ? "Signing Out..." : "Sign Out All Other Devices"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
