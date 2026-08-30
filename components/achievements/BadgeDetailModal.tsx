"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  ClockCheck,
  Award,
  Users,
  DollarSign,
  ShieldCheck,
  Flame,
  Crown,
  Sparkles,
  Zap,
  Gem,
  Lock,
  CheckCircle2,
  Share2,
  Check,
  Gift,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { AchievementBadge } from "@/types/achievement";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const ICON_MAP: Record<string, LucideIcon> = {
  ClockCheck,
  Award,
  Users,
  DollarSign,
  ShieldCheck,
  Flame,
  Crown,
  Sparkles,
  Zap,
  Gem,
};

interface BadgeDetailModalProps {
  badge: AchievementBadge | null;
  onClose: () => void;
}

export default function BadgeDetailModal({ badge, onClose }: BadgeDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, badge !== null, onClose);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (badge) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  const Icon = ICON_MAP[badge.iconName] || Award;
  const progressPct = badge.earned
    ? 100
    : badge.progress.target > 0
    ? Math.min(
        100,
        Math.round((badge.progress.current / badge.progress.target) * 100)
      )
    : 0;

  const formattedDate = badge.earnedAt
    ? new Date(badge.earnedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleShare = async () => {
    const shareText = `🏆 I unlocked the "${badge.title}" achievement on Ahjoor Savings Circles! (+${badge.xp} XP)`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-modal-title"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-lg rounded-3xl bg-[var(--modal)] border border-[var(--ov-14)] shadow-2xl p-6 sm:p-8 overflow-hidden text-[var(--text)]"
      >
        {/* Background Glow */}
        <div
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none bg-[#4B6B76]"
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          aria-label="Close modal"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {/* Modal Content Header */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Badge Icon Orb */}
          <div
            className={`relative w-24 h-24 rounded-3xl flex items-center justify-center border-2 mb-4 transition-transform shadow-xl ${
              badge.earned
                ? "bg-[var(--content)] border-[#4B6B76] shadow-[0_0_32px_rgba(75,107,118,0.3)] text-[#4B6B76]"
                : "bg-[var(--ov-05)] border-[var(--ov-14)] text-[var(--muted)]"
            }`}
          >
            {badge.earned ? (
              <Icon size={44} aria-hidden="true" />
            ) : (
              <Lock size={36} className="text-[var(--faint)]" aria-hidden="true" />
            )}

            {badge.earned && (
              <div
                className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-[var(--modal)] shadow-sm"
                title="Earned"
              >
                <CheckCircle2 size={16} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--ov-0a)] border border-[var(--ov-10)] text-[var(--text)]">
              {badge.tier} tier
            </span>
            <span className="text-xs text-[var(--muted)] capitalize">
              {badge.category}
            </span>
          </div>

          <h2
            id="badge-modal-title"
            className="text-2xl font-bold font-sora text-[var(--text)] mt-1"
          >
            {badge.title}
          </h2>

          <p className="text-sm text-[var(--muted)] mt-2 max-w-sm">
            {badge.description}
          </p>

          <div className="flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
            <span>+{badge.xp} Achievement XP</span>
          </div>
        </div>

        {/* Progress & Details Box */}
        <div className="mt-6 space-y-4">
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-[var(--ov-05)] border border-[var(--ov-08)]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-[var(--muted)]">Status</span>
              <span
                className={`font-semibold ${
                  badge.earned ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {badge.earned
                  ? `Earned on ${formattedDate}`
                  : `In Progress (${progressPct}%)`}
              </span>
            </div>

            {!badge.earned && (
              <div className="space-y-1.5 mt-2">
                <div
                  className="w-full h-2 bg-[var(--ov-0a)] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[#4B6B76] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[var(--muted)]">
                  <span>
                    Current: {badge.progress.current} {badge.progress.unit}
                  </span>
                  <span>
                    Target: {badge.progress.target} {badge.progress.unit}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Unlock Criteria Box */}
          <div className="p-4 rounded-2xl bg-[var(--ov-05)] border border-[var(--ov-08)]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
              Unlock Requirement
            </h4>
            <p className="text-sm text-[var(--text)]">{badge.criteria}</p>
          </div>

          {/* Reward / Perk Box */}
          {badge.perk && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--ov-05)] to-[var(--ov-08)] border border-[var(--ov-10)] flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <Gift size={18} aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                  Unlocked Reward
                </h4>
                <p className="text-xs text-[var(--text)] mt-0.5">{badge.perk}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          {badge.earned ? (
            <button
              type="button"
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              {copied ? (
                <>
                  <Check size={16} aria-hidden="true" />
                  <span>Achievement Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={16} aria-hidden="true" />
                  <span>Share Achievement</span>
                </>
              )}
            </button>
          ) : (
            <Link
              href="/dashboard/circles"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              <span>Explore Circles to Progress</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[var(--ov-14)] hover:bg-[var(--ov-08)] text-sm font-medium text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
