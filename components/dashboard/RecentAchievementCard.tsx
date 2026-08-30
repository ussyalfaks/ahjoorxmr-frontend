"use client";

import Link from "next/link";
import {
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ClockCheck,
  Award,
  Users,
  DollarSign,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getMostRecentEarnedBadge } from "@/data/achievements";

const ICON_MAP: Record<string, LucideIcon> = {
  ClockCheck,
  Award,
  Users,
  DollarSign,
  ShieldCheck,
};

export default function RecentAchievementCard() {
  const badge = getMostRecentEarnedBadge();

  if (!badge) return null;

  const Icon = ICON_MAP[badge.iconName] || Award;
  const formattedDate = badge.earnedAt
    ? new Date(badge.earnedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="bg-[var(--modal)] p-6 rounded-2xl border border-[var(--ov-10)] flex flex-col justify-between group hover:border-[#4B6B76]/50 transition-all duration-200">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy size={16} aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Latest Achievement
              </span>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
            +{badge.xp} XP
          </span>
        </div>

        {/* Badge Item Body */}
        <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[var(--ov-05)] border border-[var(--ov-08)]">
          <div className="w-11 h-11 rounded-xl bg-[#4B6B76]/15 text-[#4B6B76] border border-[#4B6B76]/30 flex items-center justify-center shrink-0">
            <Icon size={22} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold font-sora text-[var(--text)] truncate">
                {badge.title}
              </h4>
              <CheckCircle2
                size={14}
                className="text-emerald-500 shrink-0"
                aria-label="Earned badge"
              />
            </div>
            <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">
              {badge.description}
            </p>
            <span className="inline-block text-[10px] text-[var(--faint)] mt-1 font-mono">
              Earned on {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-[var(--ov-08)] flex items-center justify-between">
        <span className="text-xs text-[var(--muted)] flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" aria-hidden="true" />
          <span>Keep saving to unlock next tier</span>
        </span>
        <Link
          href="/dashboard/achievements"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4B6B76] hover:text-[#3D5A64] dark:text-[var(--info)] transition-colors"
        >
          <span>View All Badges</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
