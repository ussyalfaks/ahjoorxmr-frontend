import { safeStorage } from "@/lib/safeStorage";
export interface CircleRulesRecord {
  markdown: string;
  updatedAt: string;
}

/** Splits rules markdown into one plain-text rule per non-empty line (list markers and headings stripped). */
export function rulesMarkdownToList(markdown: string): string[] {
  return markdown
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)]|#{1,6})\s+/, "").trim())
    .filter(Boolean);
}

const RULES_KEY = "ahjoorxmr:circle-rules";
export const CIRCLE_RULES_UPDATED_EVENT = "ahjoorxmr:circle-rules-updated";

function readAll(): Record<string, CircleRulesRecord> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(safeStorage.getItem(RULES_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getCircleRules(circleId: string): CircleRulesRecord | null {
  const record = readAll()[circleId];
  return record?.markdown ? record : null;
}

export function saveCircleRules(circleId: string, markdown: string): CircleRulesRecord | null {
  const rules = readAll();
  const cleaned = markdown.trim();

  if (!cleaned) {
    delete rules[circleId];
    safeStorage.setItem(RULES_KEY, JSON.stringify(rules));
    window.dispatchEvent(new CustomEvent(CIRCLE_RULES_UPDATED_EVENT, { detail: { circleId } }));
    return null;
  }

  const record = { markdown: cleaned, updatedAt: new Date().toISOString() };
  safeStorage.setItem(RULES_KEY, JSON.stringify({ ...rules, [circleId]: record }));
  window.dispatchEvent(new CustomEvent(CIRCLE_RULES_UPDATED_EVENT, { detail: { circleId } }));
  return record;
}

/** Removes HTML and unsafe URL schemes before markdown is interpreted for display. */
export function sanitizeCircleRules(markdown: string): string {
  return markdown
    .replace(/<[^>]*>/g, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/data\s*:/gi, "")
    .trim();
}