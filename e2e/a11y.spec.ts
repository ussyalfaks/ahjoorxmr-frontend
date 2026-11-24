import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Main routes checked for WCAG 2.1 A/AA violations on every run. */
const ROUTES = [
  "/",
  "/login",
  "/calculator",
  "/help",
  "/dashboard",
  "/dashboard/circles",
  "/dashboard/circles/1",
  "/dashboard/circles/1/analytics",
  "/dashboard/contributions",
  "/dashboard/payouts",
  "/dashboard/settings",
];

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

for (const route of ROUTES) {
  test(`${route} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    // Compact summary so failures are readable in CI logs.
    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    }));

    expect(summary).toEqual([]);
  });
}

test("chart data table toggle has no violations", async ({ page }) => {
  await page.goto("/dashboard/circles/1/analytics");
  await page.getByRole("button", { name: "View as table" }).first().click();

  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).include("table").analyze();

  expect(results.violations).toEqual([]);
});
