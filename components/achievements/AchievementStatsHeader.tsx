"use client";

import { Trophy, Search, X, Award, Flame, Users, ShieldCheck, DollarSign, Lock, CheckCircle2 } from "lucide-react";
import { AchievementFilter, AchievementStats, BadgeCategory } from "@/types/achievement";

interface AchievementStatsHeaderProps {
  stats: AchievementStats;
  currentFilter: AchievementFilter;
  onFilterChange: (filter: AchievementFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TABS: { id: AchievementFilter; label: string; icon?: React.ElementType }[] = [
  { id: "all", label: "All Badges" },
  { id: "earned", label: "Earned", icon: CheckCircle2 },
  { id: "locked", label: "In Progress", icon: Lock },
  { id: "contributions", label: "Contributions", icon: DollarSign },
  { id: "circles", label: "Circles", icon: Award },
  { id: "streaks", label: "Streaks", icon: Flame },
  { id: "social", label: "Social & Referrals", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
];

export default function AchievementStatsHeader({
  stats,
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: AchievementStatsHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unlocked Progress Card */}
        <div className="p-6 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#4B6B76]/10 text-[#4B6B76] flex items-center justify-center">
              <Trophy size={20} aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
              {stats.completionPct}% Complete
            </span>
          </div>

          <div>
            <p className="text-xs text-[var(--muted)] font-medium mb-1">
              Badges Unlocked
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold font-sora text-[var(--text)]">
                {stats.earned}
              </h3>
              <span className="text-sm text-[var(--muted)]">/ {stats.total} Total</span>
            </div>
            {/* Progress Bar */}
            <div
              className="mt-3 w-full h-2 bg-[var(--ov-0a)] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={stats.completionPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-[#4B6B76] rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* XP & Rewards Card */}
        <div className="p-6 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award size={20} aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
              Level 4 Saver
            </span>
          </div>

          <div>
            <p className="text-xs text-[var(--muted)] font-medium mb-1">
              Achievement XP Earned
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold font-sora text-amber-500">
                {stats.earnedXp.toLocaleString()}
              </h3>
              <span className="text-sm text-[var(--muted)]">
                / {stats.totalXp.toLocaleString()} XP
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-2">
              Next Rank: <span className="font-semibold text-[var(--text)]">Gold Vault Master (1,500 XP)</span>
            </p>
          </div>
        </div>

        {/* Consistency & Reputation Card */}
        <div className="p-6 rounded-2xl bg-[var(--modal)] border border-[var(--ov-10)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Flame size={20} aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
              Top 10% Saver
            </span>
          </div>

          <div>
            <p className="text-xs text-[var(--muted)] font-medium mb-1">
              Saving Consistency Record
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold font-sora text-[var(--text)]">
                100%
              </h3>
              <span className="text-sm text-[var(--muted)]">On-Time Score</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-2">
              Zero defaults across all joined rotating pools
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Tab Buttons */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none"
          role="tablist"
          aria-label="Filter achievements"
        >
          {TABS.map((tab) => {
            const isActive = currentFilter === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                  isActive
                    ? "bg-[#4B6B76] text-white shadow-sm"
                    : "bg-[var(--ov-05)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)]"
                }`}
              >
                {TabIcon && <TabIcon size={13} aria-hidden="true" />}
                <span>{tab.label}</span>
                {tab.id === "earned" && (
                  <span className="ml-1 text-[10px] opacity-80">({stats.earned})</span>
                )}
                {tab.id === "locked" && (
                  <span className="ml-1 text-[10px] opacity-80">({stats.locked})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search achievements..."
            aria-label="Search achievements"
            className="w-full h-9 pl-9 pr-8 rounded-xl bg-[var(--ov-05)] border border-[var(--ov-10)] text-xs text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Clear search"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
