"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trophy, ArrowLeft, Search, Sparkles } from "lucide-react";
import { MOCK_ACHIEVEMENTS } from "@/data/achievements";
import { AchievementBadge, AchievementFilter } from "@/types/achievement";
import {
  calculateAchievementStats,
  filterAchievements,
} from "@/lib/achievements";
import AchievementStatsHeader from "@/components/achievements/AchievementStatsHeader";
import BadgeCard from "@/components/achievements/BadgeCard";
import BadgeDetailModal from "@/components/achievements/BadgeDetailModal";

export default function AchievementsPage() {
  const [filter, setFilter] = useState<AchievementFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(
    null
  );

  const stats = useMemo(
    () => calculateAchievementStats(MOCK_ACHIEVEMENTS),
    []
  );

  const filteredBadges = useMemo(
    () => filterAchievements(MOCK_ACHIEVEMENTS, filter, searchQuery),
    [filter, searchQuery]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header with breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
            <Link
              href="/dashboard"
              className="hover:text-[var(--text)] transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={12} aria-hidden="true" />
              <span>Overview</span>
            </Link>
            <span>/</span>
            <span className="text-[var(--text)] font-medium">Achievements</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4B6B76]/15 text-[#4B6B76] flex items-center justify-center">
              <Trophy size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-sora text-[var(--text)]">
                Achievement Badges
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Complete on-time contributions, host circles, and earn exclusive milestone badges.
              </p>
            </div>
          </div>
        </div>

        {/* Quick action / info pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-[var(--ov-05)] border border-[var(--ov-10)] text-xs text-[var(--muted)]">
          <Sparkles size={14} className="text-amber-500" aria-hidden="true" />
          <span>
            <strong className="text-[var(--text)]">{stats.earned}</strong> of{" "}
            {stats.total} Badges Unlocked
          </span>
        </div>
      </div>

      {/* Overview Stats & Filtering Bar */}
      <AchievementStatsHeader
        stats={stats}
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Badges Grid Section */}
      <section aria-label="Achievements collection">
        {filteredBadges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-[var(--modal)] border border-[var(--ov-0a)]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--ov-08)] flex items-center justify-center text-[var(--muted)] mb-3">
              <Search size={24} aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold font-sora text-[var(--text)]">
              No badges found
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-sm">
              {searchQuery
                ? `No achievements match "${searchQuery}". Try a different search term or category.`
                : "No achievements in this category yet."}
            </p>
            {(searchQuery || filter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[var(--ov-08)] hover:bg-[var(--ov-10)] text-xs font-semibold text-[var(--text)] transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onSelect={(b) => setSelectedBadge(b)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Badge Detail Modal on click */}
      <BadgeDetailModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
}
