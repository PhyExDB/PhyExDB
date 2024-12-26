import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test.describe("Register Page", () => {
  test("should have link to login page", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" })
    await expect(page.getByRole("main")).toContainText("Anmelden")
    await expect(page.getByRole("link", { name: "Anmelden" })).toHaveAttribute("href", "/login")
  })

  test("should validate email", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" })
    await page.locator("#email").click()
    await page.locator("#email").fill("hallo")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: E-Mail
      - textbox: hallo
      - alert: Invalide E-Mail-Adresse
      `)
    await page.locator("#email").click()
    await page.locator("#email").fill("hallo@test.test")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: E-Mail
      - textbox: hallo@test.test
      `)
  })

  test("should validate password", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" })
    await page.locator("#password").fill("pass")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Passwort
      - textbox: pass
      - alert: Passwort muss mindestens 8 Zeichen lang sein
      `)
    await page.locator("#password").click()
    await page.locator("#password").fill("password")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Passwort
      - textbox: password
      - alert: Passwort muss mindestens einen Grossbuchstaben enthalten
      `)
    await page.locator("#password").click()
    await page.locator("#password").fill("Password")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Passwort
      - textbox: Password
      - alert: Passwort muss mindestens eine Zahl enthalten
      `)
    await page.locator("#password").click()
    await page.locator("#password").press("ControlOrMeta+ArrowLeft")
    await page.locator("#password").fill("1Password")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Passwort
      - textbox: 1Password
      `)
    await page.locator("#confirmPassword").click()
    await page.locator("#confirmPassword").fill("password")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Passwort wiederholen
      - textbox: password
      - alert: Passwörter stimmen nicht überein
      `)
    await page.locator("#confirmPassword").click()
    await page.locator("#confirmPassword").fill("1Password")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Passwort wiederholen
      - textbox: 1Password
      `)
  })

  test("should display errors and work correctly", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" })
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - main:
        - heading "Registrieren" [level=3]
        - paragraph: Gib deine E-Mail Adresse an und lege deinen Benutzernamen und dein Passwort fest.
        - text: E-Mail
        - textbox
        - text: Nutzername
        - textbox
        - text: Passwort
        - textbox
        - text: Passwort wiederholen
        - textbox
        - button "Registrieren"
        - text: Bereits registriert?
        - link "Anmelden"
    `)
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - main:
        - heading "Registrieren" [level=3]
        - paragraph: Gib deine E-Mail Adresse an und lege deinen Benutzernamen und dein Passwort fest.
        - text: E-Mail
        - textbox
        - alert: E-Mail-Adresse muss angegeben werden
        - text: Nutzername
        - textbox
        - alert: Nutzername muss angegeben werden
        - text: Passwort
        - textbox
        - alert: Passwort muss angegeben werden
        - text: Passwort wiederholen
        - textbox
        - alert: Passwort muss wiederholt werden
        - button "Registrieren"
        - text: Bereits registriert?
        - link "Anmelden"
    `)
    await page.locator("#email").click()
    const id = uuidv4()
    const username = `user-${id}`
    const email = `${username}@test.test`
    await page.locator("#email").fill(email)
    await page.locator("#email").press("Tab")
    await page.locator("#username").fill(username)
    await page.locator("#username").press("Tab")
    await page.locator("#password").fill("1Password")
    await page.locator("#password").press("Tab")
    await page.locator("#confirmPassword").fill("1Password")
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - main:
        - heading "Registrieren" [level=3]
        - paragraph: Gib deine E-Mail Adresse an und lege deinen Benutzernamen und dein Passwort fest.
        - text: E-Mail
        - textbox: ${email}
        - text: Nutzername
        - textbox: ${username}
        - text: Passwort
        - textbox: 1Password
        - text: Passwort wiederholen
        - textbox: 1Password
        - button "Registrieren"
        - text: Bereits registriert?
        - link "Anmelden"
    `)
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page).toHaveURL("/profile")

    await page.goto("/register", { waitUntil: "commit" })
    await expect(page).toHaveURL("/profile")
  })
})
