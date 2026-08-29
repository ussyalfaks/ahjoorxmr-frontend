"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import {
  ANNOUNCEMENT_MAX_LENGTH,
  ANNOUNCEMENTS_EVENT,
  addAnnouncement,
  getAnnouncementCooldownRemaining,
  getAnnouncementsForCircle,
} from "@/lib/announcements";
import { addNotification } from "@/lib/notifications";
import { useToast } from "@/components/ui/Toast";
import type { AnnouncementPriority, CircleAnnouncement } from "@/types/announcement";

interface AnnouncementComposerProps {
  circleId: string;
  circleName: string;
  organizerAddress: string;
}

function formatCooldown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function truncate(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

export default function AnnouncementComposer({
  circleId,
  circleName,
  organizerAddress,
}: AnnouncementComposerProps) {
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("normal");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<CircleAnnouncement[]>([]);
  const [cooldownMs, setCooldownMs] = useState(0);

  useEffect(() => {
    const sync = () => {
      setHistory(getAnnouncementsForCircle(circleId));
      setCooldownMs(getAnnouncementCooldownRemaining(circleId));
    };
    sync();
    window.addEventListener(ANNOUNCEMENTS_EVENT, sync);
    return () => window.removeEventListener(ANNOUNCEMENTS_EVENT, sync);
  }, [circleId]);

  // Tick the cooldown countdown down to zero once a second while it's active.
  useEffect(() => {
    if (cooldownMs <= 0) return;
    const interval = setInterval(() => {
      setCooldownMs(getAnnouncementCooldownRemaining(circleId));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownMs, circleId]);

  const onCooldown = cooldownMs > 0;
  const trimmed = message.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= ANNOUNCEMENT_MAX_LENGTH && !onCooldown && !sending;

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      addAnnouncement({
        circleId,
        circleName,
        message: trimmed,
        priority,
        sentBy: organizerAddress,
      });
      addNotification({
        id: `announcement-notif-${circleId}-${Date.now()}`,
        type: "announcement",
        title: priority === "urgent" ? `Urgent update from ${circleName}` : `New announcement from ${circleName}`,
        description: trimmed,
        href: `/dashboard/circles/${circleId}`,
      });
      showToast({
        title: "Announcement sent",
        message: "Every participant will see it in their notifications and the activity feed.",
        variant: "success",
      });
      setMessage("");
      setPriority("normal");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-[var(--content)] p-6 rounded-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold font-sora text-[var(--text)] flex items-center gap-2">
          <Megaphone size={18} aria-hidden="true" />
          Announcements
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Broadcast a message to every participant — it lands in their notifications and this circle&apos;s
          activity feed.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="announcement-message" className="sr-only">
          Announcement message
        </label>
        <textarea
          id="announcement-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, ANNOUNCEMENT_MAX_LENGTH))}
          placeholder="e.g. Contributions for round 3 are due Friday — please pay early if you can."
          className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm resize-none placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Announcement priority">
            <button
              type="button"
              role="radio"
              aria-checked={priority === "normal"}
              onClick={() => setPriority("normal")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                priority === "normal"
                  ? "bg-[#4B6B76] text-white"
                  : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={priority === "urgent"}
              onClick={() => setPriority("urgent")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B5B] ${
                priority === "urgent"
                  ? "bg-[#FF5B5B] text-white"
                  : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Urgent
            </button>
          </div>
          <span className="text-[10px] text-[var(--faint)] tabular-nums">
            {trimmed.length}/{ANNOUNCEMENT_MAX_LENGTH}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          {onCooldown ? (
            <p className="text-xs text-[var(--muted)]">
              You can send another announcement in {formatCooldown(cooldownMs)}.
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={!canSend}
            onClick={handleSend}
            className="px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            {sending ? "Sending…" : "Send Announcement"}
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--ov-14)] pt-4">
        <h3 className="text-sm font-medium text-[var(--text)] mb-2">Sent announcements</h3>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No announcements sent yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="rounded-xl bg-[var(--ov-05)] px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--text)]">{item.message}</span>
                  {item.priority === "urgent" && (
                    <span className="shrink-0 rounded-full bg-[#FF5B5B22] px-2 py-0.5 text-[10px] font-semibold text-[#FF5B5B]">
                      URGENT
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-[var(--faint)]">
                  {truncate(item.sentBy)} · {new Date(item.sentAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
