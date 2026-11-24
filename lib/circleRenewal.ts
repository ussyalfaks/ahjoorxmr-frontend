import { safeStorage } from "@/lib/safeStorage";
import { generateSeed, seededShuffle, savePayoutDraw, type PayoutDraw } from "@/lib/payoutDraw";
import type { DiscoverCircle } from "@/data/circles";

export type RenewalOptInStatus = "opted_in" | "opted_out" | "pending";

export interface CircleRenewalConfig {
  circleId: string;
  enabled: boolean;
  enabledAt: string;
  redrawPayoutOrder: boolean;
  nextCycleName?: string;
  optIns: Record<string, RenewalOptInStatus>;
  renewedCircleId?: string | null;
  renewedAt?: string | null;
}

export interface StoredParticipant {
  address: string;
  slot: number;
  paid: boolean;
  role: "organizer" | "co-organizer" | "participant";
}

export interface StoredRoundHistoryRow {
  round: number;
  recipient: string;
  amount: string;
  completedAt: string;
}

export interface StoredCycleCircle extends DiscoverCircle {
  participants: StoredParticipant[];
  createdAt: string;
  roundHistory: StoredRoundHistoryRow[];
  nextPayoutRecipient?: string;
  nextPayoutDeadline?: Date | null;
  isOrganizer?: boolean;
  isCoOrganizer?: boolean;
  isMember?: boolean;
  status: "active" | "completed" | "pending";
  parentCircleId?: string;
  cycleNumber?: number;
}

const RENEWALS_STORAGE_KEY = "ahjoor:circle-renewals";
const STORED_CIRCLES_STORAGE_KEY = "ahjoor:custom-circles";
export const CIRCLE_RENEWAL_UPDATED_EVENT = "ahjoor:circle-renewal-updated";

function readRenewals(): Record<string, CircleRenewalConfig> {
  if (typeof window === "undefined") return {};
  try {
    const raw = safeStorage.getItem(RENEWALS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRenewals(renewals: Record<string, CircleRenewalConfig>) {
  try {
    safeStorage.setItem(RENEWALS_STORAGE_KEY, JSON.stringify(renewals));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CIRCLE_RENEWAL_UPDATED_EVENT));
    }
  } catch {
    // Ignore storage errors
  }
}

export function getCircleRenewal(circleId: string): CircleRenewalConfig | null {
  return readRenewals()[circleId] ?? null;
}

export function saveCircleRenewal(config: CircleRenewalConfig): void {
  const renewals = readRenewals();
  renewals[config.circleId] = config;
  writeRenewals(renewals);
}

/**
 * Checks if the organizer is allowed to enable auto-renew.
 * Auto-renew can only be enabled BEFORE the final round (i.e. currentRound < totalRounds).
 */
export function canEnableAutoRenew(
  currentRound: number,
  totalRounds: number,
  status?: string
): { allowed: boolean; reason?: string } {
  if (status === "completed") {
    return {
      allowed: false,
      reason: "This circle is already completed. Auto-renew had to be enabled before the final round.",
    };
  }

  if (currentRound >= totalRounds && totalRounds > 0) {
    return {
      allowed: false,
      reason: "Auto-renew can only be enabled before the final round begins.",
    };
  }

  return { allowed: true };
}

/**
 * Enables auto-renew for a circle before the final round.
 * Sets up member opt-in roster with organizer defaulted to opted_in and other members pending.
 */
export function enableCircleRenewal(
  circleId: string,
  members: string[],
  creatorAddress: string,
  redrawPayoutOrder = true,
  nextCycleName?: string
): CircleRenewalConfig {
  const existing = getCircleRenewal(circleId);
  const optIns: Record<string, RenewalOptInStatus> = {};

  members.forEach((addr) => {
    const normalized = addr.toLowerCase();
    if (existing?.optIns[normalized]) {
      optIns[normalized] = existing.optIns[normalized];
    } else if (normalized === creatorAddress.toLowerCase()) {
      optIns[normalized] = "opted_in";
    } else {
      optIns[normalized] = "pending";
    }
  });

  const config: CircleRenewalConfig = {
    circleId,
    enabled: true,
    enabledAt: existing?.enabledAt ?? new Date().toISOString(),
    redrawPayoutOrder,
    nextCycleName: nextCycleName ?? existing?.nextCycleName,
    optIns,
    renewedCircleId: existing?.renewedCircleId ?? null,
    renewedAt: existing?.renewedAt ?? null,
  };

  saveCircleRenewal(config);
  return config;
}

/**
 * Disables auto-renew for a circle.
 */
export function disableCircleRenewal(circleId: string): void {
  const existing = getCircleRenewal(circleId);
  if (!existing) return;
  const updated: CircleRenewalConfig = {
    ...existing,
    enabled: false,
  };
  saveCircleRenewal(updated);
}

/**
 * Sets a member's opt-in choice for the next cycle.
 */
export function setMemberRenewalOptIn(
  circleId: string,
  memberAddress: string,
  status: RenewalOptInStatus
): CircleRenewalConfig | null {
  const existing = getCircleRenewal(circleId);
  if (!existing) return null;

  const normalized = memberAddress.toLowerCase();
  const updated: CircleRenewalConfig = {
    ...existing,
    optIns: {
      ...existing.optIns,
      [normalized]: status,
    },
  };

  saveCircleRenewal(updated);
  return updated;
}

/* ========================================================================== */
/* Custom Stored Circles for Created / Renewed Cycles                        */
/* ========================================================================== */

export function getStoredCircles(): StoredCycleCircle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeStorage.getItem(STORED_CIRCLES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCircle(circle: StoredCycleCircle): void {
  const current = getStoredCircles().filter((c) => c.id !== circle.id);
  current.unshift(circle);
  try {
    safeStorage.setItem(STORED_CIRCLES_STORAGE_KEY, JSON.stringify(current));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CIRCLE_RENEWAL_UPDATED_EVENT));
    }
  } catch {
    // Ignore storage errors
  }
}

export function getStoredCircle(id: string): StoredCycleCircle | null {
  const circles = getStoredCircles();
  return circles.find((c) => c.id === id) ?? null;
}

/**
 * Derives the next cycle name from an existing name.
 * e.g. "Family savings" -> "Family savings (Cycle 2)"
 * e.g. "Family savings (Cycle 2)" -> "Family savings (Cycle 3)"
 */
export function getNextCycleName(currentName: string): string {
  const cycleMatch = currentName.match(/\(Cycle (\d+)\)$/i);
  if (cycleMatch) {
    const nextNum = parseInt(cycleMatch[1], 10) + 1;
    return currentName.replace(/\(Cycle \d+\)$/i, `(Cycle ${nextNum})`);
  }
  return `${currentName} (Cycle 2)`;
}

export interface RenewCircleCycleParams {
  parentCircle: {
    id: string;
    name: string;
    creator: string;
    contribution: string;
    duration: string;
    category?: string;
    description?: string;
    isPrivate?: boolean;
    penaltyEnabled?: boolean;
    penaltyType?: "percentage" | "fixed";
    penaltyValue?: string;
    penalty?: { enabled: boolean; type: "percentage" | "fixed"; value: string };
    totalSlots?: number;
    reserveEnabled?: boolean;
    reservePercentage?: number;
    reserveBalance?: number;
  };
  config: CircleRenewalConfig;
  currentWallet?: string;
}

/**
 * Creates a new cycle circle preserving settings and only including opted-in members.
 * Reuses circle duplicate / clone logic and the fair draw tool.
 */
export function renewCircleCycle({
  parentCircle,
  config,
  currentWallet,
}: RenewCircleCycleParams): {
  newCircle: StoredCycleCircle;
  draw: PayoutDraw | null;
} {
  // Collect all addresses that opted in
  const optedInAddresses = Object.entries(config.optIns)
    .filter(([_, status]) => status === "opted_in")
    .map(([address]) => address);

  if (optedInAddresses.length < 2) {
    throw new Error("At least 2 members must opt in to create a new cycle.");
  }

  const cycleName = config.nextCycleName || getNextCycleName(parentCircle.name);
  const newCircleId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `circle-cycle-${Date.now()}`;

  // Fair Draw Tool integration:
  // Redraw payout order for the new cycle using seeded shuffle or preserve previous order
  let finalPayoutOrder: string[] = [];
  let draw: PayoutDraw | null = null;

  if (config.redrawPayoutOrder) {
    const seed = generateSeed();
    finalPayoutOrder = seededShuffle(optedInAddresses, seed);
    draw = {
      circleId: newCircleId,
      order: finalPayoutOrder,
      seed,
      timestamp: new Date().toISOString(),
      locked: true,
    };
    savePayoutDraw(draw);
  } else {
    finalPayoutOrder = [...optedInAddresses];
    draw = {
      circleId: newCircleId,
      order: finalPayoutOrder,
      seed: "preserved-order",
      timestamp: new Date().toISOString(),
      locked: true,
    };
    savePayoutDraw(draw);
  }

  // Build participant slots based on payout order
  const participants: StoredParticipant[] = finalPayoutOrder.map((address, index) => {
    const isCreator = address.toLowerCase() === parentCircle.creator.toLowerCase();
    return {
      address,
      slot: index + 1,
      paid: false,
      role: isCreator ? "organizer" : "participant",
    };
  });

  const penaltyEnabled =
    parentCircle.penaltyEnabled ?? parentCircle.penalty?.enabled ?? false;
  const penaltyType =
    parentCircle.penaltyType ?? parentCircle.penalty?.type ?? "percentage";
  const penaltyValue =
    parentCircle.penaltyValue ?? parentCircle.penalty?.value ?? "10";
  const reserveEnabled = parentCircle.reserveEnabled ?? false;
  const reservePercentage = parentCircle.reservePercentage ?? 0;

  const newCircle: StoredCycleCircle = {
    id: newCircleId,
    name: cycleName,
    creator: parentCircle.creator,
    members: optedInAddresses,
    totalSlots: optedInAddresses.length,
    contribution: parentCircle.contribution,
    duration: parentCircle.duration,
    category: (parentCircle.category as any) ?? "family",
    description: parentCircle.description ?? "",
    isPrivate: parentCircle.isPrivate ?? false,
    penaltyEnabled,
    penaltyType,
    penaltyValue,
    reserveEnabled,
    reservePercentage,
    reserveBalance: 0,
    currentRound: 1,
    totalRounds: optedInAddresses.length,
    status: "active",
    participants,
    createdAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    roundHistory: [],
    nextPayoutRecipient: finalPayoutOrder[0],
    nextPayoutDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isOrganizer: currentWallet
      ? parentCircle.creator.toLowerCase() === currentWallet.toLowerCase()
      : false,
    isCoOrganizer: false,
    isMember: currentWallet
      ? optedInAddresses.some((a) => a.toLowerCase() === currentWallet.toLowerCase())
      : false,
    parentCircleId: parentCircle.id,
  };

  // Persist the new circle
  saveStoredCircle(newCircle);

  // Update the renewal config with the new circle link
  const updatedConfig: CircleRenewalConfig = {
    ...config,
    renewedCircleId: newCircleId,
    renewedAt: new Date().toISOString(),
  };
  saveCircleRenewal(updatedConfig);

  return { newCircle, draw };
}
