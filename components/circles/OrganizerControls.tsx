"use client";

import { useState } from "react";

/**
 * Types — adjust these to match your actual Circle/Member types
 * if you already have them defined elsewhere (e.g. types/circle.ts).
 * Feel free to delete these and import the real ones instead.
 */
export interface CircleMember {
  address: string;
  displayName?: string;
  role?: CircleRole;
}

export type CircleRole = "organizer" | "co-organizer" | "participant";

export interface Circle {
  id: string;
  creatorAddress: string;
  members: CircleMember[];
  status: "active" | "closed";
}

interface OrganizerControlsProps {
  circle: Circle;
  connectedAddress?: string | null;
  onRemoveMember: (address: string) => Promise<void> | void;
  onChangeRole: (address: string, role: CircleRole) => Promise<void> | void;
  onCloseCircle: () => Promise<void> | void;
  onExtendRound: (extraDays: number) => Promise<void> | void;
}

/**
 * Small helper for case-insensitive address comparison.
 */
function isSameAddress(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * A two-step confirm wrapper. First click arms the action and shows
 * a confirm prompt; second click (within the same render) fires it.
 * Satisfies "All destructive actions require a second confirmation step".
 */
function useConfirm() {
  const [armedKey, setArmedKey] = useState<string | null>(null);

  function requestConfirm(key: string) {
    setArmedKey(key);
  }

  function cancel() {
    setArmedKey(null);
  }

  function isArmed(key: string) {
    return armedKey === key;
  }

  return { requestConfirm, cancel, isArmed };
}

export function OrganizerControls({
  circle,
  connectedAddress,
  onRemoveMember,
  onChangeRole,
  onCloseCircle,
  onExtendRound,
}: OrganizerControlsProps) {
  const currentMember = circle.members.find((member) => isSameAddress(member.address, connectedAddress));
  const isOrganizer = isSameAddress(connectedAddress, circle.creatorAddress);
  const canManageCircle = isOrganizer || currentMember?.role === "co-organizer";

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [extendDays, setExtendDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const removeConfirm = useConfirm();
  const roleConfirm = useConfirm();

  // Read-only participants see nothing from this component.
  if (!canManageCircle) {
    return null;
  }

  async function handleRemove(address: string) {
    setBusy(true);
    try {
      await onRemoveMember(address);
    } finally {
      setBusy(false);
      removeConfirm.cancel();
    }
  }

  async function handleRoleChange(address: string, role: CircleRole) {
    setBusy(true);
    try {
      await onChangeRole(address, role);
    } finally {
      setBusy(false);
      roleConfirm.cancel();
    }
  }

  async function handleConfirmedClose() {
    setBusy(true);
    try {
      await onCloseCircle();
    } finally {
      setBusy(false);
      setShowCloseModal(false);
    }
  }

  async function handleExtend() {
    setBusy(true);
    try {
      await onExtendRound(extendDays);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-500/10 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Organizer Controls
        </span>
        <span className="rounded-full bg-amber-200 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300">
          {isOrganizer ? "You created this circle" : "You help manage this circle"}
        </span>
      </div>

      {/* Member management */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--text)]">
            {isOrganizer ? "Manage Roles" : "Participants"}
          </h3>
          {isOrganizer && (
            <p className="mt-1 text-xs text-gray-500 dark:text-[var(--muted)]">
              Promote a trusted participant to help manage this circle.
            </p>
          )}
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-[var(--border)] rounded-md border border-gray-200 dark:border-[var(--border)] bg-white dark:bg-[var(--content)]">
          {circle.members.map((member) => {
            const isCreator = isSameAddress(member.address, circle.creatorAddress);
            const confirmKey = `remove-${member.address}`;
            const role = isCreator ? "organizer" : member.role ?? "participant";
            const nextRole: CircleRole = role === "co-organizer" ? "participant" : "co-organizer";
            const roleConfirmKey = `role-${member.address}-${nextRole}`;
            return (
              <li
                key={member.address}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-800 dark:text-[var(--text)]">
                    {member.displayName ?? member.address}
                  </span>
                  {isCreator && (
                    <span className="rounded-full bg-blue-100 dark:bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                      Organizer
                    </span>
                  )}
                  {!isCreator && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      role === "co-organizer"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-[var(--muted)]"
                    }`}>
                      {role === "co-organizer" ? "Co-Organizer" : "Participant"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                {!isCreator && isOrganizer &&
                  (roleConfirm.isArmed(roleConfirmKey) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-700 dark:text-amber-400">
                        {nextRole === "co-organizer" ? "Promote?" : "Demote?"}
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleRoleChange(member.address, nextRole)}
                        className="rounded bg-[#4B6B76] px-2 py-1 text-xs font-medium text-white hover:bg-[#3D5A64] disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={roleConfirm.cancel}
                        className="rounded border border-gray-300 dark:border-[var(--border)] px-2 py-1 text-xs text-gray-600 dark:text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-[var(--ov-0a)]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => roleConfirm.requestConfirm(roleConfirmKey)}
                      className="rounded border border-[#4B6B76]/50 px-2 py-1 text-xs font-medium text-[#4B6B76] hover:bg-[#4B6B76]/10"
                    >
                      {nextRole === "co-organizer" ? "Promote" : "Demote"}
                    </button>
                  ))}
                {!isCreator &&
                  (removeConfirm.isArmed(confirmKey) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 dark:text-red-400">Remove this member?</span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleRemove(member.address)}
                        className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={removeConfirm.cancel}
                        className="rounded border border-gray-300 dark:border-[var(--border)] px-2 py-1 text-xs text-gray-600 dark:text-[var(--muted)] hover:bg-gray-50 dark:hover:bg-[var(--ov-0a)]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeConfirm.requestConfirm(confirmKey)}
                      className="rounded border border-red-300 dark:border-red-800/60 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Remove Member
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Extend round duration */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-[var(--text)]">Extend Round</h3>
        <input
          type="number"
          min={1}
          value={extendDays}
          onChange={(e) => setExtendDays(Number(e.target.value))}
          className="w-16 rounded border border-gray-300 dark:border-[var(--border)] dark:bg-[var(--content)] dark:text-[var(--text)] px-2 py-1 text-sm"
        />
        <span className="text-xs text-gray-500 dark:text-[var(--muted)]">days</span>
        <button
          type="button"
          disabled={busy}
          onClick={handleExtend}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Extend
        </button>
      </div>

      {/* Close circle */}
      <div>
        <button
          type="button"
          disabled={busy || circle.status === "closed"}
          onClick={() => setShowCloseModal(true)}
          className="rounded bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
        >
          {circle.status === "closed" ? "Circle Closed" : "Close Circle Early"}
        </button>
      </div>

      {showCloseModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-[var(--modal)] p-5 shadow-lg">
            <h4 className="text-base font-semibold text-gray-900 dark:text-[var(--text)]">
              Close this circle early?
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-[var(--muted)]">
              Closing the circle ends the current round immediately. Remaining
              contributions will be settled according to the circle&apos;s payout
              rules, and no further members can join or contribute. This action
              cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="rounded border border-gray-300 dark:border-[var(--border)] px-3 py-1.5 text-sm text-gray-700 dark:text-[var(--text)] hover:bg-gray-50 dark:hover:bg-[var(--ov-0a)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleConfirmedClose}
                className="rounded bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                Yes, close circle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}