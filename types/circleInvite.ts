export type InviteChannel = "email" | "sms" | "stellar";

export type InviteStatus = "sent" | "opened" | "joined";

export interface CircleInvite {
  id: string;
  circleId: string;
  circleName: string;
  /** Normalized email address, E.164 phone number or Stellar account ID (G...). */
  recipient: string;
  /** Federation address (name*domain) the recipient was resolved from, if any. */
  federationAddress?: string;
  channel: InviteChannel;
  status: InviteStatus;
  /** Join link included in the message; carries `inviteRef` for tracking. */
  link: string;
  sentAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

export interface ParsedRecipient {
  raw: string;
  /** Normalized value when valid. */
  value?: string;
  channel?: InviteChannel;
  error?: string;
  /** Set for `name*domain` entries; `value` is filled in once it resolves. */
  federationAddress?: string;
  resolving?: boolean;
}
