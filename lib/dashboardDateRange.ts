/**
 * dashboardDateRange.ts
 * Date range calculation and stats filtering for the dashboard overview.
 */

export type DateRangePreset = "30d" | "90d" | "year" | "all" | "custom";

export interface DateRangeState {
  preset: DateRangePreset;
  startDate: Date | null;
  endDate: Date | null;
}

export interface DashboardRangeStats {
  totalSaved: string;
  totalSavedChange: string;
  activePools: number;
  activePoolsChange: string;
  nextPayout: string;
  nextPayoutChange: string;
  completedCircles: number;
  completedCirclesChange: string;
}

export const PRESET_OPTIONS: { id: DateRangePreset; label: string }[] = [
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
];

/**
 * Calculates start and end dates for standard presets.
 */
export function getPresetDateRange(
  preset: DateRangePreset,
  now: Date = new Date()
): { startDate: Date | null; endDate: Date | null } {
  const end = new Date(now);

  switch (preset) {
    case "30d": {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return { startDate: start, endDate: end };
    }
    case "90d": {
      const start = new Date(now);
      start.setDate(now.getDate() - 90);
      return { startDate: start, endDate: end };
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { startDate: start, endDate: end };
    }
    case "all":
    default:
      return { startDate: null, endDate: null };
  }
}

/**
 * Returns dashboard key stats adjusted for the selected date range.
 */
export function getStatsForRange(
  preset: DateRangePreset,
  customRange?: { startDate: Date | null; endDate: Date | null }
): DashboardRangeStats {
  switch (preset) {
    case "30d":
      return {
        totalSaved: "$310",
        totalSavedChange: "+35%",
        activePools: 3,
        activePoolsChange: "+50%",
        nextPayout: "$50",
        nextPayoutChange: "+20%",
        completedCircles: 2,
        completedCirclesChange: "+100%",
      };
    case "90d":
      return {
        totalSaved: "$620",
        totalSavedChange: "+85%",
        activePools: 5,
        activePoolsChange: "+120%",
        nextPayout: "$50",
        nextPayoutChange: "+100%",
        completedCircles: 4,
        completedCirclesChange: "+100%",
      };
    case "year":
      return {
        totalSaved: "$850",
        totalSavedChange: "+145%",
        activePools: 6,
        activePoolsChange: "+160%",
        nextPayout: "$50",
        nextPayoutChange: "+150%",
        completedCircles: 8,
        completedCirclesChange: "+160%",
      };
    case "custom": {
      if (customRange?.startDate && customRange?.endDate) {
        const days = Math.max(
          1,
          Math.round(
            (customRange.endDate.getTime() - customRange.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        const ratio = Math.min(days / 365, 1);
        const amount = Math.max(50, Math.round(1000 * ratio));
        return {
          totalSaved: `$${amount}`,
          totalSavedChange: `+${Math.round(200 * ratio)}%`,
          activePools: Math.max(1, Math.round(8 * ratio)),
          activePoolsChange: `+${Math.round(150 * ratio)}%`,
          nextPayout: "$50",
          nextPayoutChange: "+50%",
          completedCircles: Math.max(1, Math.round(12 * ratio)),
          completedCirclesChange: `+${Math.round(100 * ratio)}%`,
        };
      }
      return getStatsForRange("all");
    }
    case "all":
    default:
      return {
        totalSaved: "$1000",
        totalSavedChange: "+200%",
        activePools: 8,
        activePoolsChange: "+200%",
        nextPayout: "$50",
        nextPayoutChange: "+200%",
        completedCircles: 12,
        completedCirclesChange: "+200%",
      };
  }
}

/**
 * Parses URL search params into a DateRangeState.
 */
export function parseDateRangeFromParams(
  searchParams: { get: (key: string) => string | null }
): DateRangeState {
  const rangeParam = searchParams.get("range") as DateRangePreset | null;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (rangeParam === "custom" && fromParam && toParam) {
    const start = new Date(fromParam);
    const end = new Date(toParam);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return {
        preset: "custom",
        startDate: start,
        endDate: end,
      };
    }
  }

  if (rangeParam && ["30d", "90d", "year", "all"].includes(rangeParam)) {
    const dates = getPresetDateRange(rangeParam);
    return {
      preset: rangeParam,
      startDate: dates.startDate,
      endDate: dates.endDate,
    };
  }

  // Default to all time
  return {
    preset: "all",
    startDate: null,
    endDate: null,
  };
}

/**
 * Builds the URL query string for a selected preset or custom range.
 */
export function buildDateRangeQuery(
  preset: DateRangePreset,
  customRange?: { startDate: Date | null; endDate: Date | null }
): string {
  const params = new URLSearchParams();

  if (preset === "custom" && customRange?.startDate && customRange?.endDate) {
    params.set("range", "custom");
    params.set("from", customRange.startDate.toISOString().slice(0, 10));
    params.set("to", customRange.endDate.toISOString().slice(0, 10));
  } else {
    params.set("range", preset);
  }

  return params.toString();
}
