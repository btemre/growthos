# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> GOS smoke >> login page renders brand
- Location: e2e/smoke.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Growth Operating System/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Growth Operating System/i })

```

```yaml
- text: Firebase yapılandırması gerekli
- strong: "Yerel:"
- code: web/.env.local
- text: içinde
- code: NEXT_PUBLIC_FIREBASE_*
- text: değişkenlerini doldurun; sunucuyu yeniden başlatın.
- paragraph:
  - strong: "App Hosting:"
  - text: Backend → Environment içinde aynı isimli değişkenler tanımlı olsun (mümkünse hem build hem runtime). Değerler boşsa veya API anahtarında yazım hatası varsa bu ekran görünür.
- paragraph:
  - text: "Firestore için:"
  - code: firebase deploy --only firestore
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  |
  3  | test.describe("GOS smoke", () => {
  4  |   test("login page renders brand", async ({ page }) => {
  5  |     await page.goto("/login");
  6  |     await expect(
  7  |       page.getByRole("heading", { name: /Growth Operating System/i })
> 8  |     ).toBeVisible();
     |       ^ Error: expect(locator).toBeVisible() failed
  9  |     await expect(page.getByLabel("E-posta")).toBeVisible();
  10 |     await expect(page.getByRole("button", { name: /Giriş yap/i })).toBeVisible();
  11 |   });
  12 |
  13 |   test("unauthenticated dashboard redirects to login", async ({ page }) => {
  14 |     await page.goto("/dashboard");
  15 |     await expect(page).toHaveURL(/\/login/);
  16 |   });
  17 |
  18 |   test("login page has password reset", async ({ page }) => {
  19 |     await page.goto("/login");
  20 |     await expect(page.getByRole("button", { name: /Şifremi unuttum/i })).toBeVisible();
  21 |   });
  22 |
  23 |   test("calendar route loads for unauthenticated redirect", async ({ page }) => {
  24 |     await page.goto("/calendar");
  25 |     await expect(page).toHaveURL(/\/login/);
  26 |   });
  27 | });
  28 |
```