/**
 * Additional types for circle moderation features
 */

export interface MutedParticipant {
  /** Wallet address of muted user */
  address: string;
  /** When the mute was applied */
  mutedAt: Date;
  /** Organizer who muted this participant */
  mutedBy: string;
  /** Optional reason for mute */
  reason?: string;
}

export interface ModerationAction {
  id: string;
  type: "remove_message" | "mute_participant";
  targetAddress: string;
  targetMessageId?: string;
  actorAddress: string;
  circleId: string;
  timestamp: Date;
  reason?: string;
}

export interface RemovedMessage {
  id: string;
  /** Original message content is not stored for privacy */
  removedBy: string;
  removedAt: Date;
}