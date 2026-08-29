"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Archive, RotateCcw, Shuffle, ShieldAlert } from "lucide-react";
import {
  OrganizerControls,
  type Circle as OrganizerCircle,
  type CircleRole,
} from "@/components/circles/OrganizerControls";
import { useToast } from "@/components/ui/Toast";
import type { CircleJoinRequest, PenaltyConfig } from "@/types/circle";
import PayoutDrawModal from "@/components/circles/PayoutDrawModal";
import { getPayoutDraw, type PayoutDraw } from "@/lib/payoutDraw";
import AutoPaySection from "@/components/circles/AutoPaySection";
import AnnouncementComposer from "@/components/circles/AnnouncementComposer";

const REQUESTS_KEY = "ahjoorxmr:circle-join-requests";
const NOTIFICATIONS_KEY = "ahjoorxmr:notifications";

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

interface SettingsCircle {
  id: string;
  name: string;
  description: string;
  creator: string;
  status: "active" | "completed" | "pending";
  participants: { address: string; displayName?: string; role: CircleRole }[];
  contribution: string;
  duration: string;
  /** Whether any round has taken a contribution yet — gates the payout draw. */
  hasContributions: boolean;
}

// Mirrors the mock circles used elsewhere in the dashboard (same ids/creators),
// kept local to this page like the rest of the dashboard's mock data sources.
const CIRCLES: Record<string, SettingsCircle> = {
  "1": {
    id: "1",
    name: "Family savings",
    description: "Monthly savings pool for family emergencies and shared goals.",
    creator: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    status: "active",
    participants: [
      { address: CURRENT_WALLET, role: "co-organizer" },
      { address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", role: "organizer" },
      { address: "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8", role: "participant" },
    ],
    contribution: "50 USDT",
    duration: "2 Days",
    hasContributions: true,
  },
  "2": {
    id: "2",
    name: "School fees",
    description: "Pooled contributions to cover termly school fees on rotation.",
    creator: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1",
    status: "active",
    participants: [
      { address: CURRENT_WALLET, role: "participant" },
      { address: "0x222def3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9", role: "organizer" },
      { address: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", role: "participant" },
      { address: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", role: "participant" },
    ],
    contribution: "40 USDT",
    duration: "12 Days",
    hasContributions: true,
  },
  "3": {
    id: "3",
    name: "Community Fund",
    description: "Community-run pool supporting local projects each round.",
    creator: CURRENT_WALLET,
    status: "active",
    participants: [
      { address: CURRENT_WALLET, role: "organizer" },
      { address: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", role: "participant" },
      { address: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", role: "participant" },
    ],
    contribution: "25 USDT",
    duration: "5 Days",
    hasContributions: false,
  },
};

function truncate(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

export default function CircleSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const circle = CIRCLES[id];
  const { showToast } = useToast();

  const [name, setName] = useState(circle?.name ?? "");
  const [description, setDescription] = useState(circle?.description ?? "");
  const [contribution, setContribution] = useState(circle?.contribution.replace(/[^\d.]/g, "") ?? "");
  const [roundDuration, setRoundDuration] = useState(circle?.duration.replace(/[^\d.]/g, "") ?? "");
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingContribution, setSavingContribution] = useState(false);
  const [penaltyEnabled, setPenaltyEnabled] = useState(false);
  const [penaltyType, setPenaltyType] = useState<PenaltyConfig["type"]>("percentage");
  const [penaltyValue, setPenaltyValue] = useState("");
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [status, setStatus] = useState<SettingsCircle["status"] | null>(circle?.status ?? null);
  const [roles, setRoles] = useState<Record<string, CircleRole>>(() =>
    Object.fromEntries(circle?.participants.map((participant) => [participant.address, participant.role]) ?? [])
  );
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [payoutDraw, setPayoutDraw] = useState<PayoutDraw | null>(() => (circle ? getPayoutDraw(circle.id) : null));

  if (!circle) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6">
        <p className="text-[var(--muted)] mb-4">Circle not found.</p>
        <Link href="/dashboard/circles" className="text-[#4B6B76] hover:underline text-sm">
          Back to Circles
        </Link>
      </div>
    );
  }

  const currentRole = roles[CURRENT_WALLET] ?? "participant";
  const isOrganizer = circle.creator.toLowerCase() === CURRENT_WALLET.toLowerCase();
  const canManageCircle = isOrganizer || currentRole === "co-organizer";

  if (!canManageCircle) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6">
        <div className="mb-7 w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--ov-0a)] border border-[var(--ov-14)]">
          <ShieldAlert size={30} className="text-[var(--muted)]" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="font-sora font-bold text-2xl text-[var(--text)] mb-2">Access denied</h1>
        <p className="text-[var(--muted)] text-sm max-w-sm mb-8">
          Only the organizer or a co-organizer of &ldquo;{circle.name}&rdquo; can view its settings.
        </p>
        <Link
          href={`/dashboard/circles/${circle.id}`}
          className="inline-flex items-center gap-2 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Circle
        </Link>
      </div>
    );
  }

  const organizerCircle: OrganizerCircle = {
    id: circle.id,
    creatorAddress: circle.creator,
    members: circle.participants.map((participant) => ({
      ...participant,
      role: roles[participant.address] ?? participant.role,
    })),
    status: status === "active" ? "active" : "closed",
  };

  async function handleSaveDetails() {
    setSavingDetails(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast({ title: "Circle details updated", variant: "success" });
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleSaveContribution() {
    if (!penaltyIsValid) return;
    setSavingContribution(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast({
        title: "Round settings updated",
        message: "This takes effect from the next round.",
        variant: "success",
      });
    } finally {
      setSavingContribution(false);
    }
  }

  async function handleRemoveMember(address: string) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    showToast({ title: "Member removed", message: truncate(address), variant: "success" });
  }

  async function handleChangeRole(address: string, role: CircleRole) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setRoles((current) => ({ ...current, [address]: role }));
    showToast({
      title: role === "co-organizer" ? "Co-organizer promoted" : "Co-organizer demoted",
      message: truncate(address),
      variant: "success",
    });
  }

  async function handleCloseCircle() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    showToast({ title: "Circle closed", variant: "success" });
    setStatus("completed");
  }

  async function handleExtendRound(extraDays: number) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    showToast({ title: `Round extended by ${extraDays} day${extraDays === 1 ? "" : "s"}`, variant: "success" });
  }

  async function handleArchive() {
    setArchiving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast({ title: "Circle archived", variant: "success" });
    } finally {
      setArchiving(false);
      setShowArchiveModal(false);
    }
  }

  function updateRequest(request: CircleJoinRequest, nextStatus: "approved" | "rejected") {
    const organizerNote = window.prompt("Optional note for the requester:")?.trim() ?? "";
    const updated = { ...request, status: nextStatus, organizerNote, updatedAt: new Date().toISOString() };
    const requests = JSON.parse(localStorage.getItem(REQUESTS_KEY) ?? "[]") as CircleJoinRequest[];
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests.map((item) => item.id === request.id ? updated : item)));
    setJoinRequests((current) => current.map((item) => item.id === request.id ? updated : item));
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) ?? "[]");
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([
      ...notifications,
      {
        id: `join-request-${request.id}-${nextStatus}`,
        type: "join_request",
        title: `Join request ${nextStatus}`,
        description: `${request.circleName} join request was ${nextStatus}.${organizerNote ? ` Note: ${organizerNote}` : ""}`,
        timestamp: updated.updatedAt,
        href: `/dashboard/circles/${request.circleId}`,
        read: false,
      },
    ]));
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0 max-w-3xl">
      {/* Back + Title */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/dashboard/circles/${circle.id}`}
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Back to Circle"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold font-sora text-[var(--text)]">Circle Settings</h1>
        <span className="rounded-full bg-[#4B6B7622] px-2.5 py-1 text-[10px] font-medium text-[#4B6B76] uppercase tracking-wide">
          {currentRole === "co-organizer" ? "Co-Organizer" : "Organizer"}
        </span>
      </div>

      {/* Circle details */}
      <section className="bg-[var(--content)] p-6 rounded-2xl space-y-5">
        <h2 className="text-lg font-bold font-sora text-[var(--text)]">Circle Details</h2>
        <div>
          <label htmlFor="circle-name" className="block text-xs text-[var(--muted)] mb-1.5">
            Circle name
          </label>
          <input
            id="circle-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
          />
        </div>
        <div>
          <label htmlFor="circle-description" className="block text-xs text-[var(--muted)] mb-1.5">
            Description
          </label>
          <textarea
            id="circle-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
          />
        </div>
        <button
          type="button"
          disabled={savingDetails}
          onClick={handleSaveDetails}
          className="px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          {savingDetails ? "Saving..." : "Save Details"}
        </button>
      </section>

      {/* Round settings */}
      <section className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-lg font-bold font-sora text-[var(--text)]">Round Settings</h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Changes only apply to future rounds — the round in progress is unaffected.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="contribution-amount" className="block text-xs text-[var(--muted)] mb-1.5">
              Contribution amount (USDT)
            </label>
            <input
              id="contribution-amount"
              type="number"
              min={1}
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="w-32 bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
            />
          </div>
          <div>
            <label htmlFor="round-duration" className="block text-xs text-[var(--muted)] mb-1.5">
              Round duration (days)
            </label>
            <input
              id="round-duration"
              type="number"
              min={1}
              value={roundDuration}
              onChange={(e) => setRoundDuration(e.target.value)}
              className="w-32 bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
            />
          </div>
          <button
            type="button"
            disabled={savingContribution || !penaltyIsValid}
            onClick={handleSaveContribution}
            className="px-4 py-2.5 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] disabled:opacity-60 text-[var(--text)] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            {savingContribution ? "Saving..." : "Save Round Settings"}
          </button>
        </div>
        <div className="border-t border-[var(--ov-14)] pt-4">
          <label className="flex items-start gap-3 cursor-pointer" htmlFor="circle-penalty-enabled">
            <input
              id="circle-penalty-enabled"
              type="checkbox"
              checked={penaltyEnabled}
              onChange={(e) => setPenaltyEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--ov-14)] text-[#4B6B76] focus:ring-[#4B6B76]"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--text)]">Late contribution penalty</span>
              <span className="block text-xs text-[var(--muted)] mt-0.5">Apply a fee when a contribution misses its deadline.</span>
            </span>
          </label>
          {penaltyEnabled && (
            <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
              <div>
                <label htmlFor="circle-penalty-type" className="block text-xs text-[var(--muted)] mb-1.5">Penalty type</label>
                <select
                  id="circle-penalty-type"
                  value={penaltyType}
                  onChange={(e) => setPenaltyType(e.target.value as PenaltyConfig["type"])}
                  className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-3 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <div>
                <label htmlFor="circle-penalty-value" className="block text-xs text-[var(--muted)] mb-1.5">
                  {penaltyType === "percentage" ? "Percentage" : "Amount (USDT)"}
                </label>
                <input
                  id="circle-penalty-value"
                  type="number"
                  min="0.01"
                  max={penaltyType === "percentage" ? 100 : contributionAmount || undefined}
                  step="0.01"
                  value={penaltyValue}
                  onChange={(e) => setPenaltyValue(e.target.value)}
                  placeholder={penaltyType === "percentage" ? "e.g. 5" : "e.g. 2"}
                  className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-3 py-2.5 text-[var(--text)] text-sm placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                />
              </div>
            </div>
          )}
          {penaltyEnabled && !penaltyIsValid && (
            <p className="mt-2 text-xs text-red-400">Enter a positive penalty up to 100%, or no more than the contribution amount.</p>
          )}
          <p className="mt-3 text-xs text-[var(--muted)]">
            Participant terms: {penaltyEnabled && penaltyIsValid
              ? penaltyType === "percentage" ? `${penaltyValue}% of the contribution is due when late.` : `${penaltyValue} USDT is due when late.`
              : "No late contribution penalty."}
          </p>
        </div>
      </section>

      {/* Participants + extend round + close early (reuses organizer-check logic) */}
      <OrganizerControls
        circle={organizerCircle}
        connectedAddress={CURRENT_WALLET}
        onRemoveMember={handleRemoveMember}
        onChangeRole={handleChangeRole}
        onCloseCircle={handleCloseCircle}
        onExtendRound={handleExtendRound}
      />

      {/* Broadcast announcement tool */}
      <AnnouncementComposer circleId={circle.id} circleName={circle.name} organizerAddress={CURRENT_WALLET} />

      {/* Auto-Pay management */}
      <AutoPaySection
        circleId={circle.id}
        defaultAmount={circle.contribution}
        roundDuration={circle.duration}
        variant="manage"
      />

      {/* Payout order draw */}
      {!circle.hasContributions && (
        <section className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
          <div>
            <h2 className="text-lg font-bold font-sora text-[var(--text)]">Payout Order</h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Randomly assign each participant&apos;s payout round with a transparent, auditable
              draw. Only available before the circle&apos;s first contribution.
            </p>
          </div>
          {payoutDraw ? (
            <div className="space-y-3">
              <ol className="space-y-1.5">
                {payoutDraw.order.map((address, i) => (
                  <li
                    key={address}
                    className="flex items-center justify-between rounded-lg bg-[var(--ov-05)] px-3 py-2 text-sm"
                  >
                    <span className="text-[var(--faint)] text-xs">Round {i + 1}</span>
                    <span className="font-mono text-[var(--text)]">{truncate(address)}</span>
                  </li>
                ))}
              </ol>
              <p className="text-[10px] text-[var(--faint)] font-mono">
                Seed {payoutDraw.seed} · {new Date(payoutDraw.timestamp).toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() => setShowDrawModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-sm text-[var(--text)] font-medium rounded-lg transition-colors"
              >
                <RotateCcw size={14} aria-hidden="true" />
                Re-run Draw
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDrawModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Shuffle size={16} aria-hidden="true" />
              Run Payout Draw
            </button>
          )}
        </section>
      )}

      <section className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-lg font-bold font-sora text-[var(--text)]">Join Requests</h2>
          <p className="text-xs text-[var(--muted)] mt-1">Review requests from participants who want to join this private circle.</p>
        </div>
        {joinRequests.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No join requests yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--ov-14)] rounded-xl border border-[var(--ov-14)]">
            {joinRequests.map((request) => (
              <li key={request.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-[var(--text)]">{request.requester}</p>
                    <p className="text-xs text-[var(--muted)]">{request.note || "No note provided"}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${request.status === "pending" ? "bg-amber-500/15 text-amber-500" : request.status === "approved" ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500"}`}>
                    {request.status}
                  </span>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateRequest(request, "approved")} className="rounded-lg bg-[#4B6B76] px-3 py-2 text-xs font-medium text-white">Approve</button>
                    <button type="button" onClick={() => updateRequest(request, "rejected")} className="rounded-lg border border-red-400 px-3 py-2 text-xs font-medium text-red-400">Reject</button>
                  </div>
                )}
                {request.organizerNote && <p className="text-xs text-[var(--muted)]">Organizer note: {request.organizerNote}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Archive circle */}
      <section className="bg-[var(--content)] p-6 rounded-2xl space-y-3">
        <h2 className="text-lg font-bold font-sora text-[var(--text)]">Archive Circle</h2>
        <p className="text-sm text-[var(--muted)]">
          Archiving hides this circle from active lists once every round has completed. It stays
          disabled while a round is still active.
        </p>
        <button
          type="button"
          disabled={status === "active"}
          onClick={() => setShowArchiveModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF5B5B1a] hover:bg-[#FF5B5B29] disabled:opacity-40 disabled:cursor-not-allowed text-[#FF5B5B] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B5B]"
        >
          <Archive size={16} aria-hidden="true" />
          Archive Circle
        </button>
      </section>

      {showArchiveModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-modal-title"
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => !archiving && setShowArchiveModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[var(--modal)] border border-[var(--ov-14)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="archive-modal-title" className="text-base font-semibold text-[var(--text)]">
              Archive this circle?
            </h4>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Archived circles are hidden from active circle lists. This can&apos;t be undone from
              here.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={archiving}
                onClick={() => setShowArchiveModal(false)}
                className="rounded-lg border border-[var(--ov-14)] px-3.5 py-2 text-sm text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={archiving}
                onClick={handleArchive}
                className="rounded-lg bg-[#FF5B5B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#e14e4e] transition-colors disabled:opacity-70"
              >
                {archiving ? "Archiving..." : "Yes, archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PayoutDrawModal
        open={showDrawModal}
        onClose={() => setShowDrawModal(false)}
        circleId={circle.id}
        participantAddresses={circle.participants.map((p) => p.address)}
        onDrawFinalized={setPayoutDraw}
      />
    </div>
  );
}
