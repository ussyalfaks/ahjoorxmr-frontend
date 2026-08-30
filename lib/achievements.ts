import { AchievementBadge, AchievementFilter, AchievementStats, BadgeCategory } from "@/types/achievement";

/**
 * Computes overall completion statistics across all achievements.
 */
export function calculateAchievementStats(badges: AchievementBadge[]): AchievementStats {
  const total = badges.length;
  const earned = badges.filter((b) => b.earned).length;
  const locked = total - earned;
  const totalXp = badges.reduce((sum, b) => sum + b.xp, 0);
  const earnedXp = badges
    .filter((b) => b.earned)
    .reduce((sum, b) => sum + b.xp, 0);
  const completionPct = total > 0 ? Math.round((earned / total) * 100) : 0;

  return {
    total,
    earned,
    locked,
    totalXp,
    earnedXp,
    completionPct,
  };
}

/**
 * Filters achievements according to active tab/category filter.
 */
export function filterAchievements(
  badges: AchievementBadge[],
  filter: AchievementFilter,
  searchQuery: string = ""
): AchievementBadge[] {
  let result = badges;

  if (filter === "earned") {
    result = result.filter((b) => b.earned);
  } else if (filter === "locked") {
    result = result.filter((b) => !b.earned);
  } else if (filter !== "all") {
    result = result.filter((b) => b.category === filter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.criteria.toLowerCase().includes(q)
    );
  }

  // Sort: earned first (by earnedAt desc), then locked by highest progress percentage
  return result.sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    if (a.earned && b.earned) {
      return (
        new Date(b.earnedAt || 0).getTime() -
        new Date(a.earnedAt || 0).getTime()
      );
    }
    const aPct = a.progress.target > 0 ? a.progress.current / a.progress.target : 0;
    const bPct = b.progress.target > 0 ? b.progress.current / b.progress.target : 0;
    return bPct - aPct;
  });
}

/**
 * Evaluates whether a badge criteria condition has been met.
 * (Allows plug-in of dynamic live contribution/payout stats later).
 */
export function evaluateBadgeCriteria(
  badgeId: string,
  userStats: {
    onTimeContributions: number;
    completedCircles: number;
    referrals: number;
    totalUsdtSaved: number;
    currentStreakDays: number;
    circlesCreatedAndCompleted: number;
    membersHosted: number;
    earlyContributions: number;
    twoFactorEnabled: boolean;
  }
): { earned: boolean; currentProgress: number } {
  switch (badgeId) {
    case "badge-5-ontime":
      return {
        earned: userStats.onTimeContributions >= 5,
        currentProgress: Math.min(userStats.onTimeContributions, 5),
      };
    case "badge-first-circle":
      return {
        earned: userStats.completedCircles >= 1,
        currentProgress: Math.min(userStats.completedCircles, 1),
      };
    case "badge-referral-champion":
      return {
        earned: userStats.referrals >= 3,
        currentProgress: Math.min(userStats.referrals, 3),
      };
    case "badge-century-club":
      return {
        earned: userStats.totalUsdtSaved >= 100,
        currentProgress: Math.min(userStats.totalUsdtSaved, 100),
      };
    case "badge-vault-guardian":
      return {
        earned: userStats.twoFactorEnabled,
        currentProgress: userStats.twoFactorEnabled ? 1 : 0,
      };
    case "badge-30-day-streak":
      return {
        earned: userStats.currentStreakDays >= 30,
        currentProgress: Math.min(userStats.currentStreakDays, 30),
      };
    case "badge-circle-master":
      return {
        earned: userStats.circlesCreatedAndCompleted >= 3,
        currentProgress: Math.min(userStats.circlesCreatedAndCompleted, 3),
      };
    case "badge-super-host":
      return {
        earned: userStats.membersHosted >= 10,
        currentProgress: Math.min(userStats.membersHosted, 10),
      };
    case "badge-punctual-prodigy":
      return {
        earned: userStats.earlyContributions >= 15,
        currentProgress: Math.min(userStats.earlyContributions, 15),
      };
    case "badge-diamond-hands":
      return {
        earned: userStats.totalUsdtSaved >= 1000,
        currentProgress: Math.min(userStats.totalUsdtSaved, 1000),
      };
    default:
      return { earned: false, currentProgress: 0 };
  }
}
