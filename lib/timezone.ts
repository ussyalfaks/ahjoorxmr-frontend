export const TIMEZONE_STORAGE_KEY = "ahjoor:timezone";
export const TIMEZONE_UPDATED_EVENT = "ahjoor:timezone-updated";

export interface TimezoneOption {
  value: string;
  label: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (West Africa Time, GMT+1)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (Eastern European Time)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (South Africa Time)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (East Africa Time)" },
  { value: "America/New_York", label: "America/New_York (Eastern Time)" },
  { value: "America/Chicago", label: "America/Chicago (Central Time)" },
  { value: "America/Denver", label: "America/Denver (Mountain Time)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (Pacific Time)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (Brasilia Time)" },
  { value: "America/Toronto", label: "America/Toronto (Eastern Time)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (Gulf Standard Time)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (India Standard Time)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (Singapore Time)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (Japan Standard Time)" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong_Kong (Hong Kong Time)" },
  { value: "Europe/London", label: "Europe/London (GMT / British Summer Time)" },
  { value: "Europe/Paris", label: "Europe/Paris (Central European Time)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (Central European Time)" },
  { value: "Europe/Amsterdam", label: "Europe/Amsterdam (Central European Time)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (Eastern Australia Time)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (New Zealand Time)" },
];

/**
 * Returns the browser's default detected timezone.
 */
export function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Reads the active timezone from storage or falls back to the browser timezone.
 */
export function getTimezone(): string {
  if (typeof window === "undefined") {
    return "UTC";
  }
  try {
    const saved = localStorage.getItem(TIMEZONE_STORAGE_KEY);
    if (saved && isValidTimezone(saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return getDefaultTimezone();
}

/**
 * Validates whether a timezone identifier is recognized by Intl.
 */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Sets and persists the user's chosen timezone, dispatching a change event.
 */
export function setTimezone(tz: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!isValidTimezone(tz)) {
      console.warn(`Invalid timezone: ${tz}`);
      return;
    }
    localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
    window.dispatchEvent(new CustomEvent(TIMEZONE_UPDATED_EVENT, { detail: { timezone: tz } }));
  } catch {
    // ignore storage errors
  }
}

/**
 * Extracts the timezone abbreviation (e.g. UTC, EST, WAT, CET).
 */
export function getTimezoneAbbreviation(date: Date = new Date(), timeZone?: string): string {
  const tz = timeZone || getTimezone();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value : tz;
  } catch {
    return tz;
  }
}

/**
 * Formats time with timezone abbreviation (e.g. "6:00 PM EST" or "18:00 UTC").
 */
export function formatTimeWithTz(
  dateInput: Date | string | number,
  timeZone?: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const tz = timeZone || getTimezone();
  const abbr = getTimezoneAbbreviation(date, tz);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
    ...options,
  }).format(date);

  return `${formattedTime} ${abbr}`;
}

/**
 * Formats date and time with timezone abbreviation (e.g. "Nov 25, 2026, 6:00 PM EST").
 */
export function formatDateTimeWithTz(
  dateInput: Date | string | number,
  timeZone?: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const tz = timeZone || getTimezone();
  const abbr = getTimezoneAbbreviation(date, tz);

  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
    ...options,
  }).format(date);

  return `${formatted} ${abbr}`;
}

/**
 * Formats deadline specifically for circle countdowns and round timelines.
 */
export function formatDeadlineWithTz(
  deadline: Date | string | number | null | undefined,
  timeZone?: string
): string {
  if (!deadline) return "No deadline";
  return formatDateTimeWithTz(deadline, timeZone);
}
