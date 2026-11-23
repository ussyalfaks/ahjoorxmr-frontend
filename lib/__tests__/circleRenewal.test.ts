// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import {
  canEnableAutoRenew,
  enableCircleRenewal,
  disableCircleRenewal,
  getCircleRenewal,
  setMemberRenewalOptIn,
  renewCircleCycle,
  getNextCycleName,
  getStoredCircles,
  getStoredCircle,
} from "../circleRenewal";
import { getPayoutDraw } from "../payoutDraw";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  for (const key of Object.keys(mockStorage)) {
    delete mockStorage[key];
  }
  // SafeStorage in node environment falls back to memory or mock storage
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
});

describe("Circle Auto-Renew & Next Cycle Logic", () => {
  describe("canEnableAutoRenew", () => {
    it("allows enabling before the final round", () => {
      // Round 2 of 5
      const check = canEnableAutoRenew(2, 5, "active");
      expect(check.allowed).toBe(true);
      expect(check.reason).toBeUndefined();
    });

    it("blocks enabling on the final round", () => {
      // Round 5 of 5
      const check = canEnableAutoRenew(5, 5, "active");
      expect(check.allowed).toBe(false);
      expect(check.reason).toMatch(/before the final round/i);
    });

    it("blocks enabling after completion", () => {
      const check = canEnableAutoRenew(5, 5, "completed");
      expect(check.allowed).toBe(false);
      expect(check.reason).toMatch(/already completed/i);
    });
  });

  describe("getNextCycleName", () => {
    it("appends Cycle 2 for the first renewal", () => {
      expect(getNextCycleName("Family savings")).toBe("Family savings (Cycle 2)");
    });

    it("increments the cycle number if already numbered", () => {
      expect(getNextCycleName("Family savings (Cycle 2)")).toBe("Family savings (Cycle 3)");
      expect(getNextCycleName("Community Fund (Cycle 9)")).toBe("Community Fund (Cycle 10)");
    });
  });

  describe("enableCircleRenewal & member opt-in", () => {
    const circleId = "test-circle-1";
    const creator = "0xcreator111111111111111111111111111111111111";
    const member2 = "0xmember222222222222222222222222222222222222";
    const member3 = "0xmember333333333333333333333333333333333333";
    const members = [creator, member2, member3];

    it("initializes renewal config with organizer opted in and other members pending", () => {
      const config = enableCircleRenewal(circleId, members, creator, true);

      expect(config.enabled).toBe(true);
      expect(config.redrawPayoutOrder).toBe(true);
      expect(config.optIns[creator.toLowerCase()]).toBe("opted_in");
      expect(config.optIns[member2.toLowerCase()]).toBe("pending");
      expect(config.optIns[member3.toLowerCase()]).toBe("pending");
    });

    it("allows members to opt in or opt out", () => {
      enableCircleRenewal(circleId, members, creator, true);

      // Member 2 opts in
      const updated1 = setMemberRenewalOptIn(circleId, member2, "opted_in");
      expect(updated1?.optIns[member2.toLowerCase()]).toBe("opted_in");

      // Member 3 opts out
      const updated2 = setMemberRenewalOptIn(circleId, member3, "opted_out");
      expect(updated2?.optIns[member3.toLowerCase()]).toBe("opted_out");
    });

    it("can disable auto-renew", () => {
      enableCircleRenewal(circleId, members, creator, true);
      disableCircleRenewal(circleId);

      const config = getCircleRenewal(circleId);
      expect(config?.enabled).toBe(false);
    });
  });

  describe("renewCircleCycle (New Cycle Creation & Fair Draw)", () => {
    const parentCircle = {
      id: "parent-1",
      name: "Family Savings",
      creator: "0xcreator111111111111111111111111111111111111",
      contribution: "50 USDT",
      duration: "2 Days",
      category: "family",
      description: "Original family savings circle",
      isPrivate: false,
      totalSlots: 4,
      penalty: { enabled: true, type: "percentage" as const, value: "10" },
    };

    const creator = parentCircle.creator;
    const member2 = "0xmember222222222222222222222222222222222222";
    const member3 = "0xmember333333333333333333333333333333333333";
    const member4 = "0xmember444444444444444444444444444444444444";

    it("throws error if fewer than 2 members opted in", () => {
      const config = enableCircleRenewal(parentCircle.id, [creator, member2], creator, true);
      // Member 2 opts out
      setMemberRenewalOptIn(parentCircle.id, member2, "opted_out");

      expect(() => {
        renewCircleCycle({
          parentCircle,
          config: getCircleRenewal(parentCircle.id)!,
          currentWallet: creator,
        });
      }).toThrow(/At least 2 members/i);
    });

    it("creates a new cycle with the same settings and only opted-in members", () => {
      const config = enableCircleRenewal(
        parentCircle.id,
        [creator, member2, member3, member4],
        creator,
        true
      );
      // creator is opted in
      // member2 and member3 opt in
      setMemberRenewalOptIn(parentCircle.id, member2, "opted_in");
      setMemberRenewalOptIn(parentCircle.id, member3, "opted_in");
      // member4 opts out
      setMemberRenewalOptIn(parentCircle.id, member4, "opted_out");

      const latestConfig = getCircleRenewal(parentCircle.id)!;
      const { newCircle, draw } = renewCircleCycle({
        parentCircle,
        config: latestConfig,
        currentWallet: creator,
      });

      // Settings carry over
      expect(newCircle.name).toBe("Family Savings (Cycle 2)");
      expect(newCircle.contribution).toBe("50 USDT");
      expect(newCircle.duration).toBe("2 Days");
      expect(newCircle.category).toBe("family");
      expect(newCircle.description).toBe("Original family savings circle");
      expect(newCircle.penaltyEnabled).toBe(true);

      // Only opted-in members are included
      expect(newCircle.members).toHaveLength(3);
      expect(newCircle.members).toContain(creator);
      expect(newCircle.members).toContain(member2);
      expect(newCircle.members).toContain(member3);
      expect(newCircle.members).not.toContain(member4);
      expect(newCircle.totalSlots).toBe(3);
      expect(newCircle.participants).toHaveLength(3);

      // Fair draw was executed and saved
      expect(draw).not.toBeNull();
      expect(draw?.circleId).toBe(newCircle.id);
      expect(draw?.order).toHaveLength(3);
      expect(draw?.seed).toBeTruthy();
      expect(draw?.locked).toBe(true);

      // Verification via getPayoutDraw
      const savedDraw = getPayoutDraw(newCircle.id);
      expect(savedDraw).toEqual(draw);

      // Parent circle renewal record links to the new cycle
      const postRenewConfig = getCircleRenewal(parentCircle.id);
      expect(postRenewConfig?.renewedCircleId).toBe(newCircle.id);

      // Stored circles list contains the new circle
      expect(getStoredCircle(newCircle.id)).toBeDefined();
    });
  });
});
