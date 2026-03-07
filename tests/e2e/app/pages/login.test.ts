import { test, expect } from "@playwright/test"
import { validateFooter } from "~~/tests/helpers/validateFooter"
import { loginWith2fa } from "~~/tests/helpers/auth-helper";

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

  test("should display errors and work correctly", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" })
    await validateFooter(page)

    await page.locator("#email").fill("user@test.test")
    await page.locator("#password").fill("password")

    await page.getByRole("button", { name: "Anmelden" }).click()

    await loginWith2fa(page, "user@test.test", "password")

    await expect(page).toHaveURL("/profile")
  })
})
