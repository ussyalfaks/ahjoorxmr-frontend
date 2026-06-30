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
}

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
  onCloseCircle,
  onExtendRound,
}: OrganizerControlsProps) {
  const isOrganizer = isSameAddress(connectedAddress, circle.creatorAddress);

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [extendDays, setExtendDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const removeConfirm = useConfirm();

  // Read-only participants see nothing from this component.
  if (!isOrganizer) {
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
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Organizer Controls
        </span>
        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-800">
          You created this circle
        </span>
      </div>

      {/* Member management */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Participants</h3>
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {circle.members.map((member) => {
            const isCreator = isSameAddress(member.address, circle.creatorAddress);
            const confirmKey = `remove-${member.address}`;
            return (
              <li
                key={member.address}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-800">
                    {member.displayName ?? member.address}
                  </span>
                  {isCreator && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      Organizer
                    </span>
                  )}
                </div>

                {!isCreator &&
                  (removeConfirm.isArmed(confirmKey) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600">Remove this member?</span>
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
                        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeConfirm.requestConfirm(confirmKey)}
                      className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove Member
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Extend round duration */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-700">Extend Round</h3>
        <input
          type="number"
          min={1}
          value={extendDays}
          onChange={(e) => setExtendDays(Number(e.target.value))}
          className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <span className="text-xs text-gray-500">days</span>
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
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <h4 className="text-base font-semibold text-gray-900">
              Close this circle early?
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Closing the circle ends the current round immediately. Remaining
              contributions will be settled according to the circle&apos;s payout
              rules, and no further members can join or contribute. This action
              cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
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