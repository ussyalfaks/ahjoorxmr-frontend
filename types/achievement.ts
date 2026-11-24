export type BadgeCategory = 'contributions' | 'circles' | 'streaks' | 'social' | 'security';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface AchievementProgress {
  current: number;
  target: number;
  unit: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  iconName: string;
  earned: boolean;
  earnedAt?: string;
  progress: AchievementProgress;
  criteria: string;
  xp: number;
  perk?: string;
}

export type AchievementFilter = 'all' | 'earned' | 'locked' | BadgeCategory;

export interface AchievementStats {
  total: number;
  earned: number;
  locked: number;
  totalXp: number;
  earnedXp: number;
  completionPct: number;
}
