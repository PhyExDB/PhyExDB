import { test, expect } from "@playwright/test"
import { validateFooter } from "~~/tests/helpers/validateFooter"

test.describe("Login Page", () => {
  test("should have link to register page", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("main")).toContainText("Registrieren")
    await expect(
      page.getByRole("link", { name: "Registrieren" }),
    ).toHaveAttribute("href", "/register")
  })

  test("should validate email", async ({ page }) => {
    await page.goto("/login")

    await page.locator("#email").fill("hallo")
    await page.getByRole("button", { name: "Anmelden" }).click()

    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: E-Mail
      - textbox: hallo
      - alert: Invalide E-Mail-Adresse
    `)

    await page.locator("#email").fill("hallo@test.test")
    await page.getByRole("button", { name: "Anmelden" }).click()

    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: E-Mail
      - textbox: hallo@test.test
    `)
  })

  test("should display errors and work correctly", async ({ page }) => {
    await page.goto("/login")
    await validateFooter(page)

    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - main:
        - heading "Anmelden" [level=3]
        - paragraph: Gib deine E-Mail Adresse oder deinen Benutzernamen und dein Passwort ein.
        - text: E-Mail
        - textbox
        - text: Passwort
        - textbox
        - button "Anmelden"
        - text: Noch kein Account?
        - link "Registrieren"
    `)

    await page.getByRole("button", { name: "Anmelden" }).click()

    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - main:
        - heading "Anmelden" [level=3]
        - paragraph: Gib deine E-Mail Adresse oder deinen Benutzernamen und dein Passwort ein.
        - text: E-Mail
        - textbox
        - alert: E-Mail-Adresse muss angegeben werden
        - text: Passwort
        - textbox
        - alert: Passwort muss angegeben werden
        - button "Anmelden"
        - text: Noch kein Account?
        - link "Registrieren"
    `)

    await page.locator("#email").fill("user@test.test")
    await page.locator("#password").fill("password")

    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - main:
        - heading "Anmelden" [level=3]
        - paragraph: Gib deine E-Mail Adresse oder deinen Benutzernamen und dein Passwort ein.
        - text: E-Mail
        - textbox: user@test.test
        - text: Passwort
        - textbox: password
        - button "Anmelden"
        - text: Noch kein Account?
        - link "Registrieren"
    `)

    await page.getByRole("button", { name: "Anmelden" }).click()

    await expect(page).toHaveURL("/profile")

    // user is logged in -> redirect works
    await page.goto("/login")
    await expect(page).toHaveURL("/profile")
  })
})
