import type { SeatObligations, SeatTransferRequest, SeatTransferStatus } from "@/types/seatTransfer";

const TRANSFERS_KEY = "ahjoorxmr:seat-transfers";

/**
 * Fired whenever the seat-transfer store changes so the circle page can
 * re-derive its member list without waiting on the cross-tab `storage` event.
 */
export const SEAT_TRANSFERS_UPDATED_EVENT = "ahjoorxmr:seat-transfers-updated";

const ADDRESS_PATTERN = /^0x[0-9a-zA-Z]{8,64}$/;

function readAll(): SeatTransferRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(TRANSFERS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(transfers: SeatTransferRequest[], circleId: string) {
  try {
    localStorage.setItem(TRANSFERS_KEY, JSON.stringify(transfers));
  } catch {
    // Keep the session usable when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(SEAT_TRANSFERS_UPDATED_EVENT, { detail: { circleId } }));
}

export function getSeatTransfersForCircle(circleId: string): SeatTransferRequest[] {
  return readAll()
    .filter((t) => t.circleId === circleId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPendingSeatTransfers(circleId: string): SeatTransferRequest[] {
  return getSeatTransfersForCircle(circleId).filter((t) => t.status === "pending");
}

/** The member's open request on this circle, if any — only one may be pending at a time. */
export function getPendingTransferFrom(circleId: string, member: string): SeatTransferRequest | null {
  return getPendingSeatTransfers(circleId).find((t) => t.fromMember === member) ?? null;
}

/**
 * Maps each outgoing address to whoever finally holds that seat. Chains are
 * followed (A → B, then B → C resolves A to C) so a seat that changed hands
 * twice still lands on its current holder.
 */
export function getSeatReplacements(circleId: string): Map<string, string> {
  const approved = readAll()
    .filter((t) => t.circleId === circleId && t.status === "approved")
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  const direct = new Map<string, string>();
  for (const t of approved) direct.set(t.fromMember, t.toMember);

  const resolved = new Map<string, string>();
  for (const from of direct.keys()) {
    let current = from;
    const seen = new Set<string>();
    while (direct.has(current) && !seen.has(current)) {
      seen.add(current);
      current = direct.get(current)!;
    }
    resolved.set(from, current);
  }
  return resolved;
}

/** Applies approved transfers to any address — returns the seat's current holder. */
export function resolveSeatHolder(replacements: Map<string, string>, address: string): string {
  return replacements.get(address) ?? address;
}

export type SeatTransferValidation = { ok: true } | { ok: false; error: string };

export function validateSubstitute(input: {
  circleId: string;
  fromMember: string;
  toMember: string;
  currentMembers: string[];
}): SeatTransferValidation {
  const to = input.toMember.trim();
  if (!to) return { ok: false, error: "Enter the substitute's wallet address." };
  if (!ADDRESS_PATTERN.test(to)) return { ok: false, error: "That doesn't look like a valid wallet address." };
  if (to.toLowerCase() === input.fromMember.toLowerCase()) {
    return { ok: false, error: "You can't transfer your seat to yourself." };
  }
  if (input.currentMembers.some((m) => m.toLowerCase() === to.toLowerCase())) {
    return { ok: false, error: "This wallet already holds a seat in the circle." };
  }
  const alreadyNominated = getPendingSeatTransfers(input.circleId).some(
    (t) => t.toMember.toLowerCase() === to.toLowerCase()
  );
  if (alreadyNominated) {
    return { ok: false, error: "This wallet is already nominated for another seat in this circle." };
  }
  return { ok: true };
}

export function createSeatTransfer(input: {
  circleId: string;
  circleName: string;
  fromMember: string;
  toMember: string;
  reason: string;
  obligations: SeatObligations;
}): SeatTransferRequest {
  const now = new Date().toISOString();
  const request: SeatTransferRequest = {
    id: `seat-transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    circleId: input.circleId,
    circleName: input.circleName,
    fromMember: input.fromMember,
    toMember: input.toMember.trim(),
    reason: input.reason.trim(),
    obligations: input.obligations,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  // Replace any earlier pending request from the same member instead of stacking them.
  const others = readAll().filter(
    (t) => !(t.circleId === input.circleId && t.fromMember === input.fromMember && t.status === "pending")
  );
  writeAll([request, ...others], input.circleId);
  return request;
}

function resolve(id: string, status: Exclude<SeatTransferStatus, "pending">, organizerNote?: string) {
  const all = readAll();
  const target = all.find((t) => t.id === id);
  if (!target || target.status !== "pending") return null;

  const updated: SeatTransferRequest = {
    ...target,
    status,
    organizerNote: organizerNote?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };
  writeAll(all.map((t) => (t.id === id ? updated : t)), target.circleId);
  return updated;
}

export function approveSeatTransfer(id: string, organizerNote?: string) {
  return resolve(id, "approved", organizerNote);
}

export function rejectSeatTransfer(id: string, organizerNote?: string) {
  return resolve(id, "rejected", organizerNote);
}

export function cancelSeatTransfer(id: string) {
  return resolve(id, "cancelled");
}
