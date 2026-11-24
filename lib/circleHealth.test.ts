import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateCircleHealth, getMockCircleHealth } from "./circleHealth";

describe("calculateCircleHealth", () => {
  it("scores a circle with perfect contributions and payouts as healthy", () => {
    const result = calculateCircleHealth({
      onTimeContributions: 3,
      expectedContributions: 3,
      completedPayouts: 1,
      expectedPayouts: 1,
      disputes: 0,
    });

    assert.equal(result.score, 90);
    assert.equal(result.level, "healthy");
    assert.equal(result.label, "Healthy");
    assert.equal(result.missedContributions, 0);
    assert.equal(result.onTimeRate, 1);
    assert.equal(result.payoutReliability, 1);
  });

  it("caps the dispute penalty at two disputes but reports the real count", () => {
    const result = calculateCircleHealth({
      onTimeContributions: 4,
      expectedContributions: 4,
      completedPayouts: 2,
      expectedPayouts: 2,
      disputes: 10,
    });

    assert.equal(result.score, 80);
    assert.equal(result.level, "healthy");
    assert.equal(result.disputes, 10);
  });

  it("caps rates at 100% and never reports negative missed contributions", () => {
    const result = calculateCircleHealth({
      onTimeContributions: 5,
      expectedContributions: 3,
      completedPayouts: 4,
      expectedPayouts: 2,
      disputes: 0,
    });

    assert.equal(result.onTimeRate, 1);
    assert.equal(result.payoutReliability, 1);
    assert.equal(result.missedContributions, 0);
    assert.equal(result.score, 90);
  });

  it("clamps the score to zero and marks the circle at risk", () => {
    const result = calculateCircleHealth({
      onTimeContributions: 0,
      expectedContributions: 4,
      completedPayouts: 0,
      expectedPayouts: 2,
      disputes: 2,
    });

    assert.equal(result.score, 0);
    assert.equal(result.level, "risk");
    assert.equal(result.label, "At risk");
    assert.equal(result.missedContributions, 4);
  });
});

describe("getMockCircleHealth", () => {
  it("returns 'needs attention' for circle 1 and a neutral default for unknown ids", () => {
    const circleOne = getMockCircleHealth("1");
    assert.equal(circleOne.score, 60);
    assert.equal(circleOne.level, "attention");
    assert.equal(circleOne.label, "Needs attention");
    assert.equal(circleOne.missedContributions, 1);

    const unknown = getMockCircleHealth("does-not-exist");
    assert.equal(unknown.score, 90);
    assert.equal(unknown.level, "healthy");
    assert.equal(unknown.disputes, 0);
  });
});
