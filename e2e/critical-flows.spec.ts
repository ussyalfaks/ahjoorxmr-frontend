import { test, expect } from "@playwright/test";

test.describe("Critical User Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure mock email verification state is set up for features requiring verified email
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "ahjoor:email-verification",
        JSON.stringify({ email: "tester@ahjoor.test", verified: true })
      );
    });
  });

  test("home page loads with hero content and call to action", async ({ page }) => {
    await page.goto("/");

    // Verify page title contains application name
    await expect(page).toHaveTitle(/ahjoor/i);

    // Verify main hero heading is visible
    const mainHeading = page.getByRole("heading", { level: 1 });
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText(/save with ahjoor/i);

    // Verify key call-to-action button is visible
    await expect(page.getByRole("link", { name: /get started now/i })).toBeVisible();
  });

  test("login page displays wallet connection options", async ({ page }) => {
    await page.goto("/login");

    // Verify the login welcome heading
    await expect(
      page.getByRole("heading", { name: /welcome back/i, level: 1 })
    ).toBeVisible();

    // Verify supported wallet connection and passkey buttons are displayed
    await expect(page.getByRole("button", { name: /freighter/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /passkey/i })).toBeVisible();

    // Verify support link
    await expect(page.getByRole("link", { name: /forgot password\?/i })).toBeVisible();
  });

  test("dashboard loads with sidebar navigation and active savings", async ({ page }) => {
    await page.goto("/dashboard");

    // Verify dashboard navigation bar is present
    const nav = page.getByRole("navigation", { name: /dashboard navigation/i });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: /overview/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /circles/i })).toBeVisible();

    // Verify Active savings section heading is present on the page
    await expect(
      page.getByRole("heading", { name: /active savings/i, level: 2 })
    ).toBeVisible();
  });

  test("help page loads with search and FAQ categories", async ({ page }) => {
    await page.goto("/help");

    // Verify Help Center main heading
    await expect(
      page.getByRole("heading", { name: /help center/i, level: 1 })
    ).toBeVisible();

    // Verify search input is present
    await expect(
      page.getByPlaceholder(/search help articles/i)
    ).toBeVisible();

    // Verify FAQ category options are present
    await expect(
      page.getByRole("button", { name: /getting started/i })
    ).toBeVisible();
  });

  test("privacy policy page loads with legal information", async ({ page }) => {
    await page.goto("/privacy");

    // Verify privacy policy heading
    await expect(
      page.getByRole("heading", { name: /privacy policy/i })
    ).toBeVisible();

    // Verify content section is rendered
    await expect(page.getByText(/data we collect/i).first()).toBeVisible();
  });

  test("browse circles: view circle directory, switch tabs, and search", async ({ page }) => {
    await page.goto("/dashboard/circles");

    // Verify circles page heading
    await expect(
      page.getByRole("heading", { name: "Circles", exact: true })
    ).toBeVisible();

    // Verify tabs are available
    const myTab = page.getByRole("tab", { name: /my circles/i });
    const discoverTab = page.getByRole("tab", { name: /discover/i });

    await expect(myTab).toBeVisible();
    await expect(discoverTab).toBeVisible();

    // Default tab should be My Circles, showing circle card
    await expect(myTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { name: /family savings/i })
    ).toBeVisible();

    // Switch to Discover tab
    await discoverTab.click();
    await expect(discoverTab).toHaveAttribute("aria-selected", "true");

    // In Discover tab, verify circles appear
    await expect(
      page.getByRole("heading", { name: /community fund/i })
    ).toBeVisible();

    // Test search filter
    const searchInput = page.getByPlaceholder(/search circles/i);
    await searchInput.fill("Holiday");

    await expect(
      page.getByRole("heading", { name: /holiday savings/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /community fund/i })
    ).not.toBeVisible();
  });

  test("open circle detail: inspect circle information and tabs", async ({ page }) => {
    await page.goto("/dashboard/circles");

    // Click on Family savings circle to open its detail page
    const circleLink = page.getByRole("link", { name: /family savings/i }).first();
    await circleLink.click();

    // Verify navigation to circle detail
    await expect(page).toHaveURL(/\/dashboard\/circles\/1/);

    // Verify circle detail page title
    await expect(
      page.getByRole("heading", { name: "Family savings", level: 1 })
    ).toBeVisible();

    // Verify Overview and Discussion tabs
    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /discussion/i })).toBeVisible();

    // Verify circle parameters are displayed
    await expect(page.getByText("50 USDT").first()).toBeVisible();
    await expect(page.getByText("2 Days").first()).toBeVisible();
  });

  test("join a circle: select from discover, confirm in modal, and verify success", async ({ page }) => {
    await page.goto("/dashboard/circles");

    // Switch to Discover tab to find circles available to join
    const discoverTab = page.getByRole("tab", { name: /discover/i });
    await discoverTab.click();

    // Locate the first joinable circle card
    const joinButton = page.getByRole("button", { name: "Join Circle" }).first();
    await expect(joinButton).toBeVisible();
    await joinButton.click();

    // Verify Join Circle modal opens
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("heading", { name: /join /i })).toBeVisible();

    // Confirm joining
    const confirmButton = modal.getByRole("button", {
      name: /confirm join|request to join/i,
    });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    // Assert user-visible success state
    await expect(
      modal.getByRole("heading", { name: /you're in!|join request/i })
    ).toBeVisible();

    // Close the modal
    const doneButton = modal.getByRole("button", { name: /done|close/i });
    await doneButton.click();
    await expect(modal).not.toBeVisible();
  });

  test("create a circle: complete multi-step modal and assert new circle appears in list", async ({ page }) => {
    await page.goto("/dashboard/circles");

    // Click the Create Circle button
    const createButton = page.getByRole("button", { name: /create circle/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Verify Create Circle dialog opens
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Step 0: Choose template - select Custom
    await expect(
      modal.getByRole("heading", { name: /choose a template/i })
    ).toBeVisible();
    await modal.getByRole("button", { name: /custom/i }).click();

    // Step 1: Circle Name & Description
    await expect(
      modal.getByRole("heading", { name: /create a circle/i })
    ).toBeVisible();
    await modal.getByLabel(/circle name/i).fill("E2E Alpha Savings");
    await modal.getByRole("button", { name: /next/i }).click();

    // Step 2: Circle Settings (contribution, max members, duration)
    await expect(
      modal.getByRole("heading", { name: /circle settings/i })
    ).toBeVisible();
    await modal.getByLabel(/contribution amount/i).fill("60");
    await modal.getByLabel(/max members/i).fill("5");
    await modal.getByLabel(/round duration/i).fill("7");
    await modal.getByRole("button", { name: /next/i }).click();

    // Step 3: Review & Confirm
    await expect(
      modal.getByRole("heading", { name: /review & confirm/i })
    ).toBeVisible();
    await expect(modal.getByText("E2E Alpha Savings")).toBeVisible();
    await expect(modal.getByText("60 USDT")).toBeVisible();

    // Submit circle creation
    const submitButton = modal.getByRole("button", { name: "Create Circle" });
    await submitButton.click();

    // Step 4: Verify Success screen
    await expect(
      modal.getByRole("heading", { name: /circle created!/i })
    ).toBeVisible();

    // Close dialog
    await modal.getByRole("button", { name: "Done" }).click();
    await expect(modal).not.toBeVisible();

    // Verify newly created circle is now visible in the circle directory
    await expect(
      page.getByRole("heading", { name: "E2E Alpha Savings" })
    ).toBeVisible();
  });
});
