/**
 * Client-side invite link store with expiry, max-uses and revocation.
 * Persisted to localStorage until a backend invite service exists.
 */

export type InviteExpiry = "24h" | "7d" | "30d" | "never";

export interface InviteLink {
  token: string;
  circleId: string;
  createdAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
  revokedAt: string | null;
}

export interface InviteUsage {
  id: string;
  token: string;
  circleId: string;
  usedAt: string;
}

export type InviteStatus = "active" | "expired" | "revoked" | "exhausted" | "not_found";

const LINKS_KEY = "ahjoor_invite_links";
const USAGE_KEY = "ahjoor_invite_usage";
export const INVITES_UPDATED_EVENT = "ahjoor:invites-updated";

const EXPIRY_MS: Record<InviteExpiry, number | null> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  never: null,
};

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(INVITES_UPDATED_EVENT));
  } catch { /* ignore */ }
}

export function createInviteLink(circleId: string, expiry: InviteExpiry, maxUses: number | null): InviteLink {
  const ms = EXPIRY_MS[expiry];
  const link: InviteLink = {
    token: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
    circleId,
    createdAt: new Date().toISOString(),
    expiresAt: ms === null ? null : new Date(Date.now() + ms).toISOString(),
    maxUses: maxUses && maxUses > 0 ? maxUses : null,
    uses: 0,
    revokedAt: null,
  };
  write(LINKS_KEY, [link, ...read<InviteLink>(LINKS_KEY)]);
  return link;
}

export function getInviteLinks(circleId: string): InviteLink[] {
  return read<InviteLink>(LINKS_KEY).filter((l) => l.circleId === circleId);
}

export function getInviteLink(token: string): InviteLink | undefined {
  return read<InviteLink>(LINKS_KEY).find((l) => l.token === token);
}

export function getInviteStatus(link: InviteLink | undefined, now = Date.now()): InviteStatus {
  if (!link) return "not_found";
  if (link.revokedAt) return "revoked";
  if (link.expiresAt && new Date(link.expiresAt).getTime() <= now) return "expired";
  if (link.maxUses !== null && link.uses >= link.maxUses) return "exhausted";
  return "active";
}

export function revokeInviteLink(token: string): void {
  write(
    LINKS_KEY,
    read<InviteLink>(LINKS_KEY).map((l) => (l.token === token ? { ...l, revokedAt: new Date().toISOString() } : l))
  );
}

/** Records a use of an active link. Returns the updated status of the link before use. */
export function redeemInviteLink(token: string): { status: InviteStatus; link?: InviteLink } {
  const link = getInviteLink(token);
  const status = getInviteStatus(link);
  if (status !== "active" || !link) return { status, link };
  write(
    LINKS_KEY,
    read<InviteLink>(LINKS_KEY).map((l) => (l.token === token ? { ...l, uses: l.uses + 1 } : l))
  );
  write(USAGE_KEY, [
    { id: `invite-${token}-${Date.now()}`, token, circleId: link.circleId, usedAt: new Date().toISOString() },
    ...read<InviteUsage>(USAGE_KEY),
  ]);
  return { status, link };
}

export function getInviteUsage(circleId: string): InviteUsage[] {
  return read<InviteUsage>(USAGE_KEY).filter((u) => u.circleId === circleId);
}

export function buildInviteUrl(token: string): string {
  return `${window.location.origin}/invite/${token}`;
}
