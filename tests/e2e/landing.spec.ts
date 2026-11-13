import { expect, test } from "@playwright/test";

test("root introduction remembers entry and the logo returns to it", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByText("Every thought deserves an echo.")).toBeVisible();
  await page.getByRole("button", { name: "Open Echo", exact: true }).click();
  await expect(page.getByText("A quiet place for bright ideas.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByText("A quiet place for bright ideas.")).toBeVisible();
  await page.getByRole("button", { name: "About Echo", exact: true }).click();
  await expect(page.getByText("Every thought deserves an echo.")).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/");
});
