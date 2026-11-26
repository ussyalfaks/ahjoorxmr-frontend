import { safeStorage } from "@/lib/safeStorage";
import type { CirclePoll, PollOption } from "@/types/discussion";

const POLLS_KEY = "ahjoorxmr:circle-polls";
export const CIRCLE_POLLS_UPDATED_EVENT = "ahjoorxmr:circle-polls-updated";

function readAll(): Record<string, CirclePoll[]> {
  const parsed = safeStorage.getJSON<unknown>(POLLS_KEY, {});
  return parsed && typeof parsed === "object" ? parsed as Record<string, CirclePoll[]> : {};
}

function writeAll(data: Record<string, CirclePoll[]>, circleId: string): void {
  safeStorage.setJSON(POLLS_KEY, data);
  window.dispatchEvent(new CustomEvent(CIRCLE_POLLS_UPDATED_EVENT, { detail: { circleId } }));
}

export function getCirclePolls(circleId: string): CirclePoll[] {
  return readAll()[circleId] ?? [];
}

export function createCirclePoll(
  circleId: string,
  question: string,
  optionTexts: string[],
  createdBy: string,
  closeAt?: string
): CirclePoll {
  const cleanQuestion = question.trim();
  const cleanOptions = optionTexts.map((text) => text.trim()).filter(Boolean);
  if (!cleanQuestion) throw new Error("Poll question is required.");
  if (cleanOptions.length < 2 || cleanOptions.length > 6) {
    throw new Error("A poll must have 2 to 6 options.");
  }
  if (new Set(cleanOptions.map((text) => text.toLowerCase())).size !== cleanOptions.length) {
    throw new Error("Poll options must be unique.");
  }

  const poll: CirclePoll = {
    id: `poll-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    circleId,
    question: cleanQuestion,
    options: cleanOptions.map((text, index) => ({
      id: `option-${index}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      voterAddresses: [],
    })),
    createdBy,
    createdAt: new Date().toISOString(),
    closeAt,
    closed: false,
  };

  const all = readAll();
  all[circleId] = [poll, ...(all[circleId] ?? [])];
  writeAll(all, circleId);
  return poll;
}

export function castCirclePollVote(
  circleId: string,
  pollId: string,
  optionId: string,
  voterAddress: string
): CirclePoll[] {
  const all = readAll();
  const polls = all[circleId] ?? [];
  const normalizedVoter = voterAddress.toLowerCase();

  all[circleId] = polls.map((poll) => {
    if (poll.id !== pollId || isCirclePollClosed(poll)) return poll;
    if (!poll.options.some((option) => option.id === optionId)) return poll;

    return {
      ...poll,
      options: poll.options.map((option): PollOption => ({
        ...option,
        voterAddresses: option.id === optionId
          ? [...option.voterAddresses.filter((address) => address.toLowerCase() !== normalizedVoter), voterAddress]
          : option.voterAddresses.filter((address) => address.toLowerCase() !== normalizedVoter),
      })),
    };
  });

  writeAll(all, circleId);
  return all[circleId];
}

export function closeCirclePoll(circleId: string, pollId: string): CirclePoll[] {
  const all = readAll();
  all[circleId] = (all[circleId] ?? []).map((poll) =>
    poll.id === pollId ? { ...poll, closed: true } : poll
  );
  writeAll(all, circleId);
  return all[circleId];
}

export function isCirclePollClosed(poll: CirclePoll, now = new Date()): boolean {
  if (poll.closed) return true;
  if (!poll.closeAt) return false;
  const closeTime = new Date(poll.closeAt).getTime();
  return Number.isFinite(closeTime) && closeTime <= now.getTime();
}
