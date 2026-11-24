import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";
import CountdownTimer from "./CountdownTimer";
import RoundProgressBar from "./RoundProgressBar";
import { Toggle } from "./Toggle";

describe("ui component accessibility", () => {
  it("CountdownTimer has no axe violations", async () => {
    const { container } = render(<CountdownTimer deadline={new Date(Date.now() + 2 * 60 * 60 * 1000)} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("RoundProgressBar has no axe violations", async () => {
    const { container } = render(<RoundProgressBar current={2} total={5} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Toggle has no axe violations", async () => {
    const { container } = render(<Toggle id="toggle" label="Email alerts" checked={false} onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
