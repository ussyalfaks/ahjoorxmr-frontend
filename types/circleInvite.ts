export type InviteChannel = "email" | "sms";

export type InviteStatus = "sent" | "opened" | "joined";

export interface CircleInvite {
  id: string;
  circleId: string;
  circleName: string;
  /** Normalized email address or E.164 phone number. */
  recipient: string;
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
}
