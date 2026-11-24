/**
 * Per-circle FAQ storage — stored in localStorage alongside circle rules.
 * Organizers can add, edit, reorder, and remove Q&A pairs.
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_KEY = "ahjoorxmr:circle-faq";
export const CIRCLE_FAQ_UPDATED_EVENT = "ahjoorxmr:circle-faq-updated";

function readAll(): Record<string, FaqItem[]> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(FAQ_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, FaqItem[]>, circleId: string) {
  localStorage.setItem(FAQ_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(CIRCLE_FAQ_UPDATED_EVENT, { detail: { circleId } }));
}

export function getCircleFaq(circleId: string): FaqItem[] {
  return readAll()[circleId] ?? [];
}

export function saveCircleFaq(circleId: string, items: FaqItem[]): void {
  const all = readAll();
  all[circleId] = items;
  writeAll(all, circleId);
}

export function addFaqItem(circleId: string, question: string, answer: string): FaqItem[] {
  const items = getCircleFaq(circleId);
  const newItem: FaqItem = {
    id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: question.trim(),
    answer: answer.trim(),
  };
  const updated = [...items, newItem];
  saveCircleFaq(circleId, updated);
  return updated;
}

export function updateFaqItem(circleId: string, id: string, question: string, answer: string): FaqItem[] {
  const updated = getCircleFaq(circleId).map((item) =>
    item.id === id ? { ...item, question: question.trim(), answer: answer.trim() } : item
  );
  saveCircleFaq(circleId, updated);
  return updated;
}

export function removeFaqItem(circleId: string, id: string): FaqItem[] {
  const updated = getCircleFaq(circleId).filter((item) => item.id !== id);
  saveCircleFaq(circleId, updated);
  return updated;
}

export function reorderFaqItems(circleId: string, fromIndex: number, toIndex: number): FaqItem[] {
  const items = [...getCircleFaq(circleId)];
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  saveCircleFaq(circleId, items);
  return items;
}
