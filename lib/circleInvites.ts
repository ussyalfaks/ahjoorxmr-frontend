import { addNotification } from "@/lib/notifications";
import type { CircleInvite, InviteChannel, InviteStatus, ParsedRecipient } from "@/types/circleInvite";

const INVITES_KEY = "ahjoorxmr:circle-invites";

export const CIRCLE_INVITES_EVENT = "ahjoorxmr:circle-invites-changed";

/** Query param appended to invite links so opens/joins can be attributed. */
export const INVITE_REF_PARAM = "inviteRef";

// Rate limits (client-side guard; a real sending service must enforce its own).
export const MAX_RECIPIENTS_PER_SEND = 10;
export const MAX_INVITES_PER_HOUR = 20;
export const RESEND_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// E.164: optional +, country code 1-9, 8–15 digits total.
const PHONE_RE = /^\+?[1-9]\d{7,14}$/;

export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/[\s().-]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/** Validates a single email/phone entry and works out which channel to use. */
export function parseRecipient(raw: string): ParsedRecipient {
  const value = raw.trim();
  if (!value) return { raw, error: "Empty entry" };

  if (value.includes("@")) {
    return EMAIL_RE.test(value)
      ? { raw, value: value.toLowerCase(), channel: "email" }
      : { raw, error: "Invalid email address" };
  }

  const compact = value.replace(/[\s().-]/g, "");
  if (/^\+?\d+$/.test(compact)) {
    return PHONE_RE.test(compact)
      ? { raw, value: normalizePhone(value), channel: "sms" }
      : { raw, error: "Invalid phone number — include the country code, e.g. +234 801 234 5678" };
  }

  return { raw, error: "Enter an email address or phone number" };
}

/** Splits free-form input on commas, semicolons or new lines and de-duplicates. */
export function parseRecipientList(input: string): ParsedRecipient[] {
  const seen = new Set<string>();
  return input
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(parseRecipient)
    .filter((entry) => {
      if (!entry.value) return true;
      if (seen.has(entry.value)) return false;
      seen.add(entry.value);
      return true;
    });
}

function readAll(): CircleInvite[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(INVITES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(invites: CircleInvite[]) {
  try {
    localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
    window.dispatchEvent(new Event(CIRCLE_INVITES_EVENT));
  } catch {
    // Storage may be unavailable (private mode); invites won't persist.
  }
}

export function getCircleInvites(circleId: string): CircleInvite[] {
  return readAll()
    .filter((invite) => invite.circleId === circleId)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

/** How many more invites this circle can send in the current rolling hour. */
export function getRemainingInviteQuota(circleId: string, now = Date.now()): number {
  const recent = readAll().filter(
    (invite) => invite.circleId === circleId && now - Date.parse(invite.sentAt) < HOUR_MS
  );
  return Math.max(0, MAX_INVITES_PER_HOUR - recent.length);
}

function wasRecentlyInvited(circleId: string, recipient: string, now: number): boolean {
  return readAll().some(
    (invite) =>
      invite.circleId === circleId &&
      invite.recipient === recipient &&
      now - Date.parse(invite.sentAt) < RESEND_COOLDOWN_MS
  );
}

export function buildInviteLink(circleId: string, inviteId: string, origin: string): string {
  const params = new URLSearchParams({ invite: circleId, [INVITE_REF_PARAM]: inviteId });
  return `${origin}/dashboard/circles?${params.toString()}`;
}

export function buildInviteMessage(circleName: string, link: string, channel: InviteChannel): string {
  return channel === "sms"
    ? `You're invited to join "${circleName}" on Ahjoor: ${link}`
    : `You've been invited to join the savings circle "${circleName}" on Ahjoor.\n\nJoin here: ${link}`;
}

/**
 * Stand-in for an email/SMS provider. Delivery is simulated and logged through
 * the existing notification service so the organizer can see what went out.
 * Swap the body for a real API call (e.g. POST /api/invites) when available.
 */
async function deliverInvite(invite: CircleInvite): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const message = buildInviteMessage(invite.circleName, invite.link, invite.channel);
  addNotification({
    id: `circle-invite-${invite.id}`,
    type: "circle_invite",
    title: `Invite sent via ${invite.channel === "email" ? "email" : "SMS"}`,
    description: `${invite.recipient}: ${message.split("\n")[0]}`,
    href: `/dashboard/circles/${invite.circleId}/settings`,
  });
}

export interface SendInvitesResult {
  sent: CircleInvite[];
  skipped: { recipient: string; reason: string }[];
}

export async function sendCircleInvites(
  circleId: string,
  circleName: string,
  recipients: { value: string; channel: InviteChannel }[],
  origin: string
): Promise<SendInvitesResult> {
  const now = Date.now();
  const result: SendInvitesResult = { sent: [], skipped: [] };
  let quota = getRemainingInviteQuota(circleId, now);

  if (recipients.length > MAX_RECIPIENTS_PER_SEND) {
    throw new Error(`You can invite up to ${MAX_RECIPIENTS_PER_SEND} people at a time.`);
  }

  for (const { value, channel } of recipients) {
    if (quota <= 0) {
      result.skipped.push({ recipient: value, reason: "Hourly invite limit reached" });
      continue;
    }
    if (wasRecentlyInvited(circleId, value, now)) {
      result.skipped.push({ recipient: value, reason: "Already invited in the last 24 hours" });
      continue;
    }

    const id = `${circleId}-${now}-${Math.random().toString(36).slice(2, 8)}`;
    const timestamp = new Date().toISOString();
    const invite: CircleInvite = {
      id,
      circleId,
      circleName,
      recipient: value,
      channel,
      status: "sent",
      link: buildInviteLink(circleId, id, origin),
      sentAt: timestamp,
      updatedAt: timestamp,
    };

    await deliverInvite(invite);
    writeAll([...readAll(), invite]);
    result.sent.push(invite);
    quota -= 1;
  }

  return result;
}

const STATUS_ORDER: Record<InviteStatus, number> = { sent: 0, opened: 1, joined: 2 };

/** Advances an invite's status (never moves it backwards, e.g. joined → opened). */
export function markInviteStatus(inviteId: string, status: InviteStatus) {
  const invites = readAll();
  const target = invites.find((invite) => invite.id === inviteId);
  if (!target || STATUS_ORDER[status] <= STATUS_ORDER[target.status]) return;
  writeAll(
    invites.map((invite) =>
      invite.id === inviteId ? { ...invite, status, updatedAt: new Date().toISOString() } : invite
    )
  );
}
