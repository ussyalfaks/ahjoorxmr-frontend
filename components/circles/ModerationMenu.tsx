"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, Pause, Play, Ban } from "lucide-react";

interface ModerationMenuProps {
  isOrganizer: boolean;
  isMuted: boolean;
  messageId: string;
  authorAddress: string;
  onRemoveMessage: (messageId: string, authorAddress: string, reason?: string) => void;
  onMuteParticipant: (address: string, reason?: string) => void;
  onUnmuteParticipant?: (address: string) => void;
}

export function ModerationMenu({
  isOrganizer,
  isMuted,
  messageId,
  authorAddress,
  onRemoveMessage,
  onMuteParticipant,
  onUnmuteParticipant,
}: ModerationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOrganizer) return null;

  const handleRemove = () => {
    onRemoveMessage(messageId, authorAddress);
    setIsOpen(false);
  };

  const handleMuteToggle = () => {
    if (isMuted && onUnmuteParticipant) {
      onUnmuteParticipant(authorAddress);
    } else {
      onMuteParticipant(authorAddress);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-[var(--hover)] text-[var(--faint)] hover:text-[var(--text)] transition-colors"
        aria-label="Moderation options"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--border)] bg-[var(--popover)] py-1 shadow-lg">
          <button
            onClick={handleRemove}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            Remove message
          </button>
          <button
            onClick={handleMuteToggle}
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--hover)] ${
              isMuted ? "text-green-500" : "text-[var(--text)]"
            }`}
          >
            {isMuted ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isMuted ? "Unmute participant" : "Mute participant"}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Placeholder shown for removed messages
 */
export function RemovedMessagePlaceholder({ removedBy }: { removedBy?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--ov-05)] px-4 py-2">
      <p className="text-xs italic text-[var(--faint)]">
        This message was removed by an organizer
        {removedBy && <span className="text-[var(--muted)]"> ({removedBy.slice(0, 6)}...{removedBy.slice(-4)})</span>}
      </p>
    </div>
  );
}