import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import ChartDataTable from "./ChartDataTable";
import ContributionFiatValueChart from "./ContributionFiatValueChart";
import SavingsGrowthChart from "./SavingsGrowthChart";

// Avoid hitting CoinGecko from tests.
vi.mock("@/lib/historicalRates", () => ({
  getHistoricalUsdRate: vi.fn(async () => 1),
}));

const CONTRIBUTIONS = [
  { id: "c1", date: "2024-01-15", amount: 50 },
  { id: "c2", date: "2024-01-22", amount: 50 },
];

describe("chart accessibility", () => {
  it("SavingsGrowthChart has no axe violations as a chart", async () => {
    const { container } = render(<SavingsGrowthChart />);
    expect(screen.getByRole("img", { name: /cumulative savings chart/i })).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("SavingsGrowthChart has no axe violations as a table", async () => {
    const { container } = render(<SavingsGrowthChart />);
    fireEvent.click(screen.getByRole("button", { name: "View as table" }));
    expect(screen.getByRole("table")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ContributionFiatValueChart has no axe violations", async () => {
    const { container } = render(<ContributionFiatValueChart contributions={CONTRIBUTIONS} />);
    await screen.findByRole("img", { name: /of contributions over time/i });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ChartDataTable has no axe violations", async () => {
    const { container } = render(
      <ChartDataTable
        id="table"
        caption="Example"
        columns={[
          { key: "period", label: "Period" },
          { key: "value", label: "Value", numeric: true },
        ]}
        rows={[{ period: "Jan", value: 10 }]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
