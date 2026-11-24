"use client";

import { useMemo } from "react";
import {
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
  type LucideIcon,
} from "lucide-react";
import { AchievementBadge, BadgeTier } from "@/types/achievement";

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

const TIER_STYLES: Record<
  BadgeTier,
  {
    badgeBg: string;
    border: string;
    glow: string;
    text: string;
    label: string;
  }
> = {
  bronze: {
    badgeBg: "bg-amber-600/10 text-amber-500 border-amber-600/30",
    border: "group-hover:border-amber-500/40",
    glow: "group-hover:shadow-[0_0_24px_-4px_rgba(217,119,6,0.25)]",
    text: "text-amber-500",
    label: "Bronze",
  },
  silver: {
    badgeBg: "bg-slate-400/10 text-slate-300 border-slate-400/30",
    border: "group-hover:border-slate-400/40",
    glow: "group-hover:shadow-[0_0_24px_-4px_rgba(148,163,184,0.25)]",
    text: "text-slate-300",
    label: "Silver",
  },
  gold: {
    badgeBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    border: "group-hover:border-yellow-400/40",
    glow: "group-hover:shadow-[0_0_24px_-4px_rgba(234,179,8,0.3)]",
    text: "text-yellow-400",
    label: "Gold",
  },
  platinum: {
    badgeBg: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    border: "group-hover:border-teal-400/40",
    glow: "group-hover:shadow-[0_0_24px_-4px_rgba(20,184,166,0.3)]",
    text: "text-teal-400",
    label: "Platinum",
  },
  diamond: {
    badgeBg: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    border: "group-hover:border-violet-400/40",
    glow: "group-hover:shadow-[0_0_24px_-4px_rgba(168,85,247,0.35)]",
    text: "text-violet-400",
    label: "Diamond",
  },
};

interface BadgeCardProps {
  badge: AchievementBadge;
  onSelect: (badge: AchievementBadge) => void;
}

export default function BadgeCard({ badge, onSelect }: BadgeCardProps) {
  const Icon = ICON_MAP[badge.iconName] || Award;
  const tierStyle = TIER_STYLES[badge.tier];

  const progressPct = useMemo(() => {
    if (badge.earned) return 100;
    if (badge.progress.target <= 0) return 0;
    return Math.min(
      100,
      Math.round((badge.progress.current / badge.progress.target) * 100)
    );
  }, [badge]);

  const formattedDate = useMemo(() => {
    if (!badge.earnedAt) return null;
    return new Date(badge.earnedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [badge.earnedAt]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(badge)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(badge);
        }
      }}
      aria-label={`${badge.title} - ${badge.earned ? "Earned" : "Locked"}`}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
        badge.earned
          ? `bg-[var(--content)] border-[var(--ov-10)] ${tierStyle.border} ${tierStyle.glow}`
          : "bg-[var(--ov-03)] border-[var(--ov-08)] hover:bg-[var(--ov-06)] opacity-75 hover:opacity-100"
      }`}
    >
      <div>
        {/* Top bar: Category + Tier + XP */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierStyle.badgeBg}`}
            >
              {tierStyle.label}
            </span>
            <span className="text-[10px] text-[var(--muted)] capitalize">
              {badge.category}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)]">
            <span className="text-amber-500 font-mono">+{badge.xp}</span>
            <span className="text-[9px] uppercase tracking-wider">XP</span>
          </div>
        </div>

        {/* Badge Icon & Status Header */}
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
              badge.earned
                ? `${tierStyle.badgeBg} shadow-sm`
                : "bg-[var(--ov-08)] border-[var(--ov-10)] text-[var(--muted)]"
            }`}
          >
            {badge.earned ? (
              <Icon size={24} aria-hidden="true" />
            ) : (
              <Lock size={20} className="text-[var(--faint)]" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold font-sora text-[var(--text)] truncate">
                {badge.title}
              </h3>
              {badge.earned && (
                <CheckCircle2
                  size={15}
                  className="text-emerald-500 shrink-0"
                  aria-label="Earned badge"
                />
              )}
            </div>
            <p className="text-xs text-[var(--muted)] line-clamp-2 mt-0.5">
              {badge.description}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom section: Progress or Earned Date */}
      <div className="mt-4 pt-3 border-t border-[var(--ov-08)]">
        {badge.earned ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--muted)]">Earned</span>
            <span className="font-medium text-[var(--text)]">{formattedDate}</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--muted)]">Progress</span>
              <span className="font-mono text-[var(--text)] font-medium">
                {badge.progress.current} / {badge.progress.target}{" "}
                <span className="text-[var(--muted)]">{badge.progress.unit}</span>
              </span>
            </div>
            <div
              className="w-full h-1.5 bg-[var(--ov-0a)] rounded-full overflow-hidden"
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
          </div>
        )}
      </div>
    </div>
  );
}
