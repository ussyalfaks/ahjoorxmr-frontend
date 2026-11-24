"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Check,
  X,
  Clock,
  Dices,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  canEnableAutoRenew,
  enableCircleRenewal,
  disableCircleRenewal,
  getCircleRenewal,
  setMemberRenewalOptIn,
  renewCircleCycle,
  getNextCycleName,
  CIRCLE_RENEWAL_UPDATED_EVENT,
  type CircleRenewalConfig,
  type RenewalOptInStatus,
} from "@/lib/circleRenewal";
import { useToast } from "@/components/ui/Toast";
import PayoutDrawModal from "@/components/circles/PayoutDrawModal";
import type { PayoutDraw } from "@/lib/payoutDraw";

interface ParticipantInfo {
  address: string;
  role?: string;
  displayName?: string;
}

interface AutoRenewCircleProps {
  circle: {
    id: string;
    name: string;
    creator: string;
    status: "active" | "completed" | "pending";
    currentRound: number;
    totalRounds: number;
    contribution: string;
    duration: string;
    participants: ParticipantInfo[];
    category?: string;
    description?: string;
    isPrivate?: boolean;
    penaltyEnabled?: boolean;
    penaltyType?: "percentage" | "fixed";
    penaltyValue?: string;
    penalty?: { enabled: boolean; type: "percentage" | "fixed"; value: string };
    totalSlots?: number;
  };
  currentWallet: string;
  onCycleCreated?: (newCircleId: string) => void;
}

function truncate(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

export default function CircleAutoRenewCard({
  circle,
  currentWallet,
  onCycleCreated,
}: AutoRenewCircleProps) {
  const { showToast } = useToast();
  const [config, setConfig] = useState<CircleRenewalConfig | null>(() =>
    getCircleRenewal(circle.id)
  );
  const [nextCycleName, setNextCycleName] = useState(() =>
    config?.nextCycleName ?? getNextCycleName(circle.name)
  );
  const [redrawOrder, setRedrawOrder] = useState(() => config?.redrawPayoutOrder ?? true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getCircleRenewal(circle.id);
      setConfig(updated);
      if (updated?.nextCycleName) {
        setNextCycleName(updated.nextCycleName);
      }
      if (typeof updated?.redrawPayoutOrder === "boolean") {
        setRedrawOrder(updated.redrawPayoutOrder);
      }
    };

    window.addEventListener(CIRCLE_RENEWAL_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CIRCLE_RENEWAL_UPDATED_EVENT, handleUpdate);
  }, [circle.id]);

  const isOrganizer = circle.creator.toLowerCase() === currentWallet.toLowerCase();
  const isMember = circle.participants.some(
    (p) => p.address.toLowerCase() === currentWallet.toLowerCase()
  );

  const renewalEligibility = canEnableAutoRenew(
    circle.currentRound,
    circle.totalRounds,
    circle.status
  );

  const participantAddresses = useMemo(
    () => circle.participants.map((p) => p.address),
    [circle.participants]
  );

  const optedInAddresses = useMemo(() => {
    if (!config || !config.optIns) return [];
    return Object.entries(config.optIns)
      .filter(([_, status]) => status === "opted_in")
      .map(([addr]) => addr);
  }, [config]);

  const optedInCount = optedInAddresses.length;
  const totalCount = circle.participants.length;

  const userStatus: RenewalOptInStatus = useMemo(() => {
    if (!config) return "pending";
    return config.optIns[currentWallet.toLowerCase()] ?? "pending";
  }, [config, currentWallet]);

  function handleEnable() {
    if (!renewalEligibility.allowed) {
      showToast({
        title: "Auto-renew restricted",
        message: renewalEligibility.reason ?? "Cannot enable auto-renew now.",
        variant: "error",
      });
      return;
    }

    const updated = enableCircleRenewal(
      circle.id,
      participantAddresses,
      circle.creator,
      redrawOrder,
      nextCycleName
    );
    setConfig(updated);
    showToast({
      title: "Auto-Renew Enabled",
      message: `Members have been asked to opt into ${nextCycleName}.`,
      variant: "success",
    });
  }

  function handleDisable() {
    disableCircleRenewal(circle.id);
    setConfig(getCircleRenewal(circle.id));
    showToast({
      title: "Auto-Renew Disabled",
      message: "The auto-renew schedule for this circle has been turned off.",
      variant: "neutral",
    });
  }

  function handleOptIn(status: RenewalOptInStatus) {
    const updated = setMemberRenewalOptIn(circle.id, currentWallet, status);
    setConfig(updated);
    showToast({
      title: status === "opted_in" ? "Opted In" : "Opted Out",
      message:
        status === "opted_in"
          ? "You are opted into the next cycle!"
          : "You opted out of the next cycle.",
      variant: status === "opted_in" ? "success" : "neutral",
    });
  }

  function handleLaunchNextCycle() {
    if (!config) return;
    if (optedInCount < 2) {
      showToast({
        title: "Not Enough Members",
        message: "At least 2 members must opt in to launch the next cycle.",
        variant: "error",
      });
      return;
    }

    try {
      setIsLaunching(true);
      const { newCircle } = renewCircleCycle({
        parentCircle: circle,
        config: {
          ...config,
          redrawPayoutOrder: redrawOrder,
          nextCycleName,
        },
        currentWallet,
      });

      showToast({
        title: "Next Cycle Launched!",
        message: `${newCircle.name} has been created with ${optedInCount} members.`,
        variant: "success",
      });

      setConfig(getCircleRenewal(circle.id));
      if (onCycleCreated) {
        onCycleCreated(newCircle.id);
      }
    } catch (err: any) {
      showToast({
        title: "Failed to Launch Cycle",
        message: err.message || "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setIsLaunching(false);
    }
  }

  // Non-members don't see renewal management
  if (!isMember && !isOrganizer) return null;

  // If renewal was completed and new cycle exists
  if (config?.renewedCircleId) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Cycle Renewed Successfully
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Live
                </span>
              </div>
              <p className="text-sm text-[var(--muted)]">
                The next cycle with {optedInCount} opted-in members is now active.
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/circles/${encodeURIComponent(config.renewedCircleId)}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4B6B76] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3D5A64]"
          >
            Go to Next Cycle
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // 1. Organizer View when Auto-Renew is not yet enabled
  if (isOrganizer && (!config || !config.enabled)) {
    return (
      <div className="rounded-2xl border border-[var(--ov-10)] bg-[var(--content)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B6B76]/10 text-[#4B6B76]">
              <RefreshCw size={20} />
            </div>
            <div>
              <h2 className="font-sora font-semibold text-[var(--text)]">
                Auto-Renew & Next Cycle
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Keep the momentum going by preparing the next cycle with current members.
              </p>
            </div>
          </div>
          <span
            className={`self-start sm:self-auto rounded-full px-2.5 py-1 text-xs font-medium ${
              renewalEligibility.allowed
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {renewalEligibility.allowed ? "Eligible before final round" : "Past final round"}
          </span>
        </div>

        {!renewalEligibility.allowed ? (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>
              {renewalEligibility.reason ??
                "Auto-renew can only be enabled before the final round begins."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2 border-t border-[var(--ov-08)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Next Cycle Name
                </label>
                <input
                  type="text"
                  value={nextCycleName}
                  onChange={(e) => setNextCycleName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--ov-14)] bg-[var(--background)] px-3.5 py-2 text-sm text-[var(--text)] focus:border-[#4B6B76] focus:outline-none"
                  placeholder={`${circle.name} (Cycle 2)`}
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text)]">
                  <input
                    type="checkbox"
                    checked={redrawOrder}
                    onChange={(e) => setRedrawOrder(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#4B6B76] focus:ring-[#4B6B76]"
                  />
                  <span>Redraw payout order using Fair Draw tool</span>
                </label>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Enabling auto-renew will immediately prompt members to opt in or opt out. The new
              cycle will retain settings ({circle.contribution}, {circle.duration} cadence) and
              launch with only opted-in participants.
            </p>

            <button
              type="button"
              onClick={handleEnable}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4B6B76] px-4 py-2 text-sm font-medium text-white hover:bg-[#3D5A64] transition"
            >
              <RefreshCw size={15} />
              Enable Auto-Renew for Next Cycle
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. Member & Organizer Active Renewal View
  return (
    <div className="rounded-2xl border border-[#4B6B76]/30 bg-[var(--content)] p-6 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--ov-08)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B6B76]/15 text-[#4B6B76]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sora font-semibold text-[var(--text)]">
                Next Cycle: {config?.nextCycleName || getNextCycleName(circle.name)}
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Auto-Renew Active
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Preserves {circle.contribution} contribution and {circle.duration} cadence.
            </p>
          </div>
        </div>

        {isOrganizer && (
          <button
            type="button"
            onClick={handleDisable}
            className="text-xs text-[var(--muted)] hover:text-rose-500 transition self-start sm:self-auto"
          >
            Turn off auto-renew
          </button>
        )}
      </div>

      {/* Member Opt-In Banner */}
      <div className="rounded-xl border border-[var(--ov-10)] bg-[var(--background)] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4B6B76]">
              Your Participation
            </span>
            <p className="text-sm font-medium text-[var(--text)] mt-0.5">
              {userStatus === "opted_in"
                ? "You have opted in to the next cycle."
                : userStatus === "opted_out"
                ? "You opted out of the next cycle."
                : "Would you like to participate in the next cycle?"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOptIn("opted_in")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                userStatus === "opted_in"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-[var(--ov-08)] text-[var(--text)] hover:bg-emerald-500/15 hover:text-emerald-600"
              }`}
            >
              <Check size={14} />
              Opt In
            </button>
            <button
              type="button"
              onClick={() => handleOptIn("opted_out")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                userStatus === "opted_out"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-[var(--ov-08)] text-[var(--muted)] hover:bg-rose-500/15 hover:text-rose-600"
              }`}
            >
              <X size={14} />
              Opt Out
            </button>
          </div>
        </div>
      </div>

      {/* Opt-In Roster & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            Member Responses ({optedInCount} of {totalCount} opted in)
          </span>
          <span>{Math.round((optedInCount / (totalCount || 1)) * 100)}% opted in</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--ov-08)]">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(optedInCount / (totalCount || 1)) * 100}%` }}
          />
        </div>

        {/* Member List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
          {circle.participants.map((p) => {
            const status = config?.optIns[p.address.toLowerCase()] ?? "pending";
            const isYou = p.address.toLowerCase() === currentWallet.toLowerCase();
            return (
              <div
                key={p.address}
                className="flex items-center justify-between rounded-lg border border-[var(--ov-08)] bg-[var(--background)] px-3 py-2 text-xs"
              >
                <span className="font-mono text-[var(--text)]">
                  {truncate(p.address)}
                  {isYou && <span className="ml-1 text-[#4B6B76] font-sans font-medium">(you)</span>}
                </span>
                {status === "opted_in" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Check size={12} /> Opted In
                  </span>
                ) : status === "opted_out" ? (
                  <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                    <X size={12} /> Opted Out
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                    <Clock size={12} /> Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Organizer Controls & Launch */}
      {isOrganizer && (
        <div className="border-t border-[var(--ov-08)] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <label className="flex items-center gap-2 cursor-pointer text-[var(--text)]">
              <input
                type="checkbox"
                checked={redrawOrder}
                onChange={(e) => setRedrawOrder(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#4B6B76] focus:ring-[#4B6B76]"
              />
              <span>Redraw payout order for new cycle</span>
            </label>

            {redrawOrder && (
              <button
                type="button"
                onClick={() => setShowDrawModal(true)}
                className="inline-flex items-center gap-1 text-[#4B6B76] hover:underline"
              >
                <Dices size={13} />
                Preview Fair Draw
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={optedInCount < 2 || isLaunching}
            onClick={handleLaunchNextCycle}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4B6B76] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3D5A64] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={15} className={isLaunching ? "animate-spin" : ""} />
            Launch Next Cycle ({optedInCount} members)
          </button>
        </div>
      )}

      {/* Payout Draw Modal */}
      {showDrawModal && (
        <PayoutDrawModal
          open={showDrawModal}
          onClose={() => setShowDrawModal(false)}
          circleId={`${circle.id}-next`}
          participantAddresses={optedInCount >= 2 ? optedInAddresses : participantAddresses}
          onDrawFinalized={(draw: PayoutDraw) => {
            showToast({
              title: "Fair Draw Simulated",
              message: `Simulated order generated with seed ${draw.seed.slice(0, 8)}…`,
              variant: "success",
            });
            setShowDrawModal(false);
          }}
        />
      )}
    </div>
  );
}
