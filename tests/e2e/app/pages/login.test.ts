import { test, expect } from "@playwright/test"
import { loginWith2fa } from "~~/tests/helpers/auth-helper"
import { users } from "~~/tests/helpers/auth"

test.describe("Login Page", () => {
  test("should have link to register page", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" })
    await expect(page.getByRole("main")).toContainText("Registrieren")
    await expect(page.getByRole("link", { name: "Registrieren" })).toHaveAttribute("href", "/register")
  })

  test("should validate email", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" })
    await page.locator("#email").click()
    await page.locator("#email").fill("hallo")
    await page.getByRole("button", { name: "Anmelden" }).click()
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: E-Mail
      - textbox: hallo
      - alert: Invalide E-Mail-Adresse
      `)
    await page.locator("#email").click()
    await page.locator("#email").fill("hallo@test.test")
    await page.getByRole("button", { name: "Anmelden" }).click()
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: E-Mail
      - textbox: hallo@test.test
      `)
  })

  test("should display errors and work correctly with 2FA", async ({ page }) => {
    const testUser = users.user

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({ status: 200, json: { twoFactorRequired: true } })
    })

    await page.route("**/api/auth/user", async (route) => {
      await route.fulfill({ status: 200, json: { ...testUser, emailVerified: true } })
    })

    await page.goto("/login", { waitUntil: "networkidle" })

    await expect(page.getByRole("main")).toContainText("Anmelden")

    await page.getByRole("button", { name: "Anmelden" }).click()
    await expect(page.locator("form")).toContainText("muss angegeben werden")

    await page.locator("#email").fill(testUser.email)
    await page.locator("#password").fill("password")

    await loginWith2fa(page, testUser.email, "password")

    await expect(page).toHaveURL(/\/profile/)

    await page.goto("/login", { waitUntil: "commit" })
    await expect(page).toHaveURL(/\/profile/)
  })
})
