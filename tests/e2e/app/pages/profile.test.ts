import { test, expect } from "@playwright/test"
import { loginWith2fa } from "~~/tests/helpers/auth-helper"
import { users } from "~~/tests/helpers/auth"

test.describe("Profile Page", () => {
  test("should show verified badge when email is verified", async ({ page }) => {
    const testUser = users.user

    await page.route("**/api/auth/user", async (route) => {
      await route.fulfill({
        status: 200,
        json: { ...testUser, emailVerified: true },
      })
    })

    await page.route("**/api/auth/login", route =>
      route.fulfill({ status: 200, json: { twoFactorRequired: true } }),
    )

    await page.goto("/login")
    await loginWith2fa(page)

    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - text: US
      - paragraph: User
      - paragraph: user@test.test
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
    `)
  })

  test("should show unverified badge when email is not verified", async ({ page }) => {
    const testUser = users.unverified

    await page.route("**/api/auth/user", async (route) => {
      await route.fulfill({
        status: 200,
        json: { ...testUser, emailVerified: false },
      })
    })

    await page.route("**/api/2fa/status*", route =>
      route.fulfill({ status: 200, json: { authenticated: true, enabled: false, verified: false } }),
    )

    await page.goto("/login")
    await page.locator("#email").fill(testUser.email)
    await page.locator("#password").fill("password")
    await page.getByRole("button", { name: "Anmelden" }).click()

    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - text: UN
      - paragraph: Unverified
      - paragraph: unverified@test.test
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
    `)

    const unverifiedSpan = page.locator("div").filter({ hasText: /^unverified@test\.test$/ }).locator("span")
    await expect(unverifiedSpan).toBeVisible()
    await unverifiedSpan.click()

    await expect(page.locator("[id^='radix-vue-popover-content']")).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist nicht verifiziert
        - button "E-Mail verifizieren"
    `)
  })

  test("dialogs should be closable", async ({ page }) => {
    const testUser = users.user

    await page.route("**/api/auth/user", async (route) => {
      await route.fulfill({ status: 200, json: testUser })
    })

    await page.goto("/login")
    await loginWith2fa(page)

    await page.getByRole("button", { name: "Name oder E-Mail ändern" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.getByRole("button", { name: "Close" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })
})
