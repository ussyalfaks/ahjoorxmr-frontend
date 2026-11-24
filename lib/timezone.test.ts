import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getDefaultTimezone,
  isValidTimezone,
  getTimezoneAbbreviation,
  formatTimeWithTz,
  formatDateTimeWithTz,
  formatDeadlineWithTz,
} from "./timezone.ts";
import {
  formatIcsDateTime,
  generateCalendarIcs,
  type CalendarEvent,
} from "./calendarExport.ts";

describe("timezone", () => {
  it("detects a valid default timezone", () => {
    const tz = getDefaultTimezone();
    assert.ok(tz && typeof tz === "string");
    assert.strictEqual(isValidTimezone(tz), true);
  });

  it("validates timezones correctly", () => {
    assert.strictEqual(isValidTimezone("UTC"), true);
    assert.strictEqual(isValidTimezone("America/New_York"), true);
    assert.strictEqual(isValidTimezone("Europe/London"), true);
    assert.strictEqual(isValidTimezone("Africa/Lagos"), true);
    assert.strictEqual(isValidTimezone("Not/A_Real_Timezone"), false);
  });

  it("extracts timezone abbreviation", () => {
    const fixedDate = new Date("2026-01-15T12:00:00Z");
    const utcAbbr = getTimezoneAbbreviation(fixedDate, "UTC");
    assert.strictEqual(utcAbbr, "UTC");

    const nyAbbr = getTimezoneAbbreviation(fixedDate, "America/New_York");
    assert.strictEqual(nyAbbr, "EST");
  });

  it("formats time and datetime with timezone abbreviation", () => {
    const fixedDate = new Date("2026-11-23T18:30:00Z");

    const timeUtc = formatTimeWithTz(fixedDate, "UTC");
    assert.ok(timeUtc.includes("6:30") || timeUtc.includes("18:30"));
    assert.ok(timeUtc.includes("UTC"));

    const dtUtc = formatDateTimeWithTz(fixedDate, "UTC");
    assert.ok(dtUtc.includes("Nov 23, 2026"));
    assert.ok(dtUtc.includes("UTC"));

    const deadlineStr = formatDeadlineWithTz(fixedDate, "UTC");
    assert.ok(deadlineStr.includes("Nov 23, 2026"));
    assert.ok(deadlineStr.includes("UTC"));
  });

  it("formats different timezones consistently", () => {
    const fixedDate = new Date("2026-06-15T14:00:00Z");
    const nyStr = formatDateTimeWithTz(fixedDate, "America/New_York");
    // 14:00 UTC = 10:00 AM EDT
    assert.ok(nyStr.includes("10:00"));
    assert.ok(nyStr.includes("EDT"));
  });
});

describe("calendarExport (.ics)", () => {
  it("formats dates in target timezone for iCalendar", () => {
    const fixedDate = new Date("2026-01-15T17:30:00Z");
    // 17:30 UTC in America/New_York (EST, -5h) is 12:30:00
    const formattedNy = formatIcsDateTime(fixedDate, "America/New_York");
    assert.strictEqual(formattedNy, "20260115T123000");

    // In UTC:
    const formattedUtc = formatIcsDateTime(fixedDate, "UTC");
    assert.strictEqual(formattedUtc, "20260115T173000");
  });

  it("generates valid RFC 5545 iCalendar data with timezone metadata", () => {
    const event: CalendarEvent = {
      id: "event-123",
      title: "Family Savings Contribution Deadline",
      description: "Round 2 contribution due: 50 USDT",
      startDate: new Date("2026-03-10T15:00:00Z"),
      endDate: new Date("2026-03-10T16:00:00Z"),
    };

    const ics = generateCalendarIcs([event], "America/New_York");

    assert.ok(ics.includes("BEGIN:VCALENDAR"));
    assert.ok(ics.includes("VERSION:2.0"));
    assert.ok(ics.includes("X-WR-TIMEZONE:America/New_York"));
    assert.ok(ics.includes("BEGIN:VEVENT"));
    assert.ok(ics.includes("DTSTART;TZID=America/New_York:20260310T110000"));
    assert.ok(ics.includes("DTEND;TZID=America/New_York:20260310T120000"));
    assert.ok(ics.includes("SUMMARY:Family Savings Contribution Deadline"));
    assert.ok(ics.includes("DESCRIPTION:Round 2 contribution due: 50 USDT"));
    assert.ok(ics.includes("END:VEVENT"));
    assert.ok(ics.includes("END:VCALENDAR"));
  });
});
