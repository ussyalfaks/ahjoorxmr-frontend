"use client";

import { useMemo } from "react";
import type { Circle } from "@/types/circle";

export interface ParticipantLike {
  address: string;
  role?: "organizer" | "co-organizer" | "participant" | string;
}

export interface CircleModerationTarget {
  id?: string;
  creator?: string;
  isOrganizer?: boolean;
  isCoOrganizer?: boolean;
  participants?: ParticipantLike[];
}

export interface CircleModerationPermissions {
  isOrganizer: boolean;
  isCoOrganizer: boolean;
  canModerate: boolean;
  canPin: boolean;
  canUnpin: boolean;
  canDeleteComment: (authorAddress?: string) => boolean;
  canModerateComment: (authorAddress?: string) => boolean;
}

/**
 * Returns moderation capabilities for the current user in a circle.
 * Organizers and co-organizers can pin/unpin messages and moderate (delete/manage) comments.
 * Regular members can delete/manage their own comments.
 */
export function useCircleModeration(
  circle?: CircleModerationTarget | Circle | null,
  currentAddress?: string
): CircleModerationPermissions {
  return useMemo(() => {
    if (!circle || !currentAddress) {
      return {
        isOrganizer: false,
        isCoOrganizer: false,
        canModerate: false,
        canPin: false,
        canUnpin: false,
        canDeleteComment: () => false,
        canModerateComment: () => false,
      };
    }

    const addrLower = currentAddress.toLowerCase();

    // Check direct boolean flags if present
    const directOrganizer = "isOrganizer" in circle ? Boolean(circle.isOrganizer) : false;
    const directCoOrganizer = "isCoOrganizer" in circle ? Boolean(circle.isCoOrganizer) : false;

    // Check creator match
    const isCreator = "creator" in circle && Boolean(circle.creator) && circle.creator!.toLowerCase() === addrLower;

    // Check participant list role if available
    let roleOrganizer = false;
    let roleCoOrganizer = false;
    if ("participants" in circle && Array.isArray(circle.participants)) {
      const match = circle.participants.find(
        (p) => p.address.toLowerCase() === addrLower
      );
      if (match?.role === "organizer") roleOrganizer = true;
      if (match?.role === "co-organizer") roleCoOrganizer = true;
    }

    const isOrganizer = directOrganizer || isCreator || roleOrganizer;
    const isCoOrganizer = directCoOrganizer || roleCoOrganizer;
    const canModerate = isOrganizer || isCoOrganizer;

    return {
      isOrganizer,
      isCoOrganizer,
      canModerate,
      canPin: canModerate,
      canUnpin: canModerate,
      canDeleteComment: (authorAddress?: string) => {
        if (!authorAddress) return canModerate;
        return canModerate || authorAddress.toLowerCase() === addrLower;
      },
      canModerateComment: (authorAddress?: string) => {
        if (!authorAddress) return canModerate;
        return canModerate || authorAddress.toLowerCase() === addrLower;
      },
    };
  }, [circle, currentAddress]);
}
import { useState, useCallback } from "react";
import type { ModerationEvent } from "@/types/discussion";

interface UseCircleModerationOptions {
  circleId: string;
  organizerAddress: string;
  onModerationAction?: (action: ModerationEvent) => void;
}

export function useCircleModeration({
  circleId,
  organizerAddress,
  onModerationAction,
}: UseCircleModerationOptions) {
  const [mutedParticipants, setMutedParticipants] = useState<Set<string>>(new Set());
  const [removedMessageIds, setRemovedMessageIds] = useState<Set<string>>(new Set());

  const isOrganizer = useCallback(
    (address: string) => address.toLowerCase() === organizerAddress.toLowerCase(),
    [organizerAddress]
  );

  const isMuted = useCallback(
    (address: string) => mutedParticipants.has(address.toLowerCase()),
    [mutedParticipants]
  );

  const isMessageRemoved = useCallback(
    (messageId: string) => removedMessageIds.has(messageId),
    [removedMessageIds]
  );

  const removeMessage = useCallback(
    (messageId: string, authorAddress: string, reason?: string) => {
      setRemovedMessageIds((prev) => new Set(prev).add(messageId));
      
      const event: ModerationEvent = {
        type: "message_removed",
        targetAddress: authorAddress,
        targetMessageId: messageId,
        actorAddress: organizerAddress,
        circleId,
        timestamp: new Date(),
        reason,
      };
      
      onModerationAction?.(event);
      return event;
    },
    [circleId, organizerAddress, onModerationAction]
  );

  const muteParticipant = useCallback(
    (address: string, reason?: string) => {
      setMutedParticipants((prev) => new Set(prev).add(address.toLowerCase()));
      
      const event: ModerationEvent = {
        type: "participant_muted",
        targetAddress: address,
        actorAddress: organizerAddress,
        circleId,
        timestamp: new Date(),
        reason,
      };
      
      onModerationAction?.(event);
      return event;
    },
    [circleId, organizerAddress, onModerationAction]
  );

  const unmuteParticipant = useCallback((address: string) => {
    setMutedParticipants((prev) => {
      const next = new Set(prev);
      next.delete(address.toLowerCase());
      return next;
    });
  }, []);

  return {
    isOrganizer,
    isMuted,
    isMessageRemoved,
    removeMessage,
    muteParticipant,
    unmuteParticipant,
    mutedParticipants: Array.from(mutedParticipants),
    removedMessageIds: Array.from(removedMessageIds),
  };
}
