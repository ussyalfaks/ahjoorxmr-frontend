export interface CircleTag {
  id: string;
  name: string;
}

interface CircleTagState {
  tags: CircleTag[];
  assignments: Record<string, string[]>;
}

export const CIRCLE_TAGS_EVENT = "ahjoor:circle-tags-changed";

function storageKey(wallet: string) {
  return `ahjoor:circle-tags:${wallet.toLowerCase()}`;
}

export function getCircleTagState(wallet: string): CircleTagState {
  if (typeof window === "undefined") return { tags: [], assignments: {} };
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(wallet)) ?? "null");
    if (!parsed || !Array.isArray(parsed.tags) || typeof parsed.assignments !== "object") {
      return { tags: [], assignments: {} };
    }
    return {
      tags: parsed.tags.filter((tag: unknown): tag is CircleTag => {
        if (!tag || typeof tag !== "object") return false;
        const candidate = tag as Partial<CircleTag>;
        return typeof candidate.id === "string" && typeof candidate.name === "string";
      }),
      assignments: parsed.assignments,
    };
  } catch {
    return { tags: [], assignments: {} };
  }
}

function saveCircleTagState(wallet: string, state: CircleTagState) {
  try {
    localStorage.setItem(storageKey(wallet), JSON.stringify(state));
    window.dispatchEvent(new Event(CIRCLE_TAGS_EVENT));
  } catch {
    // Storage can be unavailable in private browsing; the UI remains usable.
  }
}

export function createCircleTag(wallet: string, name: string): CircleTag | null {
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (!cleanName) return null;
  const state = getCircleTagState(wallet);
  if (state.tags.some((tag) => tag.name.toLowerCase() === cleanName.toLowerCase())) return null;
  const tag = { id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: cleanName };
  saveCircleTagState(wallet, { ...state, tags: [...state.tags, tag] });
  return tag;
}

export function renameCircleTag(wallet: string, tagId: string, name: string): boolean {
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (!cleanName) return false;
  const state = getCircleTagState(wallet);
  if (!state.tags.some((tag) => tag.id === tagId)) return false;
  saveCircleTagState(wallet, {
    ...state,
    tags: state.tags.map((tag) => (tag.id === tagId ? { ...tag, name: cleanName } : tag)),
  });
  return true;
}

export function deleteCircleTag(wallet: string, tagId: string) {
  const state = getCircleTagState(wallet);
  const assignments = Object.fromEntries(
    Object.entries(state.assignments).map(([circleId, ids]) => [circleId, ids.filter((id) => id !== tagId)]),
  );
  saveCircleTagState(wallet, { tags: state.tags.filter((tag) => tag.id !== tagId), assignments });
}

export function toggleCircleTag(wallet: string, circleId: string, tagId: string) {
  const state = getCircleTagState(wallet);
  const current = state.assignments[circleId] ?? [];
  const assignments = {
    ...state.assignments,
    [circleId]: current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
  };
  saveCircleTagState(wallet, { ...state, assignments });
}
