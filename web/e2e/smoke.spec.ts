import { test, expect } from "@playwright/test";

test.describe("GOS smoke", () => {
  test("login page renders brand", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /Growth Operating System/i })
    ).toBeVisible();
    await expect(page.getByLabel("E-posta")).toBeVisible();
    await expect(page.getByRole("button", { name: /Giriş yap/i })).toBeVisible();
  });

  test("unauthenticated dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page has password reset", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /Şifremi unuttum/i })).toBeVisible();
  });

  test("calendar route loads for unauthenticated redirect", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/login/);
  });
});
