import { beforeEach, describe, expect, it } from "vitest";
import {
  castCirclePollVote,
  closeCirclePoll,
  createCirclePoll,
  getCirclePolls,
  isCirclePollClosed,
} from "@/lib/circlePolls";

describe("circle polls", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates a poll with 2 to 6 options and an optional close date", () => {
    const closeAt = new Date(Date.now() + 60_000).toISOString();
    const poll = createCirclePoll("circle-1", "Meeting date?", ["Monday", "Tuesday"], "0xorganizer", closeAt);
    expect(getCirclePolls("circle-1")).toHaveLength(1);
    expect(poll.options).toHaveLength(2);
    expect(poll.closeAt).toBe(closeAt);
  });

  it("allows one vote and changing it", () => {
    const poll = createCirclePoll("circle-1", "Payout day?", ["Friday", "Monday"], "0xorganizer");
    const first = castCirclePollVote("circle-1", poll.id, poll.options[0].id, "0xmember");
    expect(first[0].options[0].voterAddresses).toEqual(["0xmember"]);

    const changed = castCirclePollVote("circle-1", poll.id, poll.options[1].id, "0xmember");
    expect(changed[0].options[0].voterAddresses).toHaveLength(0);
    expect(changed[0].options[1].voterAddresses).toEqual(["0xmember"]);
  });

  it("does not accept votes after closing", () => {
    const poll = createCirclePoll("circle-1", "Payout day?", ["Friday", "Monday"], "0xorganizer");
    closeCirclePoll("circle-1", poll.id);
    const updated = castCirclePollVote("circle-1", poll.id, poll.options[0].id, "0xmember");
    expect(updated[0].options[0].voterAddresses).toHaveLength(0);
  });

  it("treats a reached close date as closed", () => {
    const poll = createCirclePoll(
      "circle-1",
      "Payout day?",
      ["Friday", "Monday"],
      "0xorganizer",
      new Date(Date.now() - 1000).toISOString()
    );
    expect(isCirclePollClosed(poll)).toBe(true);
  });
});
