import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test.describe("Register Page", () => {
  test("should have link to login page", async ({ page }) => {
    await page.goto("/register")
    const main = page.getByRole("main")
    await expect(main).toBeVisible()
    await expect(main).toContainText("Anmelden")
    await expect(page.getByRole("link", { name: "Anmelden" })).toHaveAttribute("href", "/login")
  })

  test("should validate email", async ({ page }) => {
    await page.goto("/register")
    const form = page.locator("form")
    await page.locator("#email").fill("hallo")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(form).toMatchAriaSnapshot(`
      - text: E-Mail
      - textbox: hallo
      - alert: Invalide E-Mail-Adresse
    `)
    await page.locator("#email").fill("hallo@test.test")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(form).toMatchAriaSnapshot(`
      - text: E-Mail
      - textbox: hallo@test.test
    `)
  })

  test("should validate password", async ({ page }) => {
    await page.goto("/register")
    const form = page.locator("form")

    await page.locator("#password").fill("pass")
    await expect(form).toMatchAriaSnapshot(`
      - text: Passwort
      - textbox: pass
      - alert: Passwort muss mindestens 8 Zeichen lang sein
    `)

    await page.locator("#password").fill("password")
    await expect(form).toMatchAriaSnapshot(`
      - text: Passwort
      - textbox: password
      - alert: Passwort muss mindestens einen Grossbuchstaben enthalten
    `)

    await page.locator("#password").fill("Password")
    await expect(form).toMatchAriaSnapshot(`
      - text: Passwort
      - textbox: Password
      - alert: Passwort muss mindestens eine Zahl enthalten
    `)

    await page.locator("#password").fill("1Password")
    await page.locator("#confirmPassword").fill("password")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(form).toMatchAriaSnapshot(`
      - text: Passwort wiederholen
      - textbox: password
      - alert: Passwörter stimmen nicht überein
    `)

    await page.locator("#confirmPassword").fill("1Password")
    await expect(form).toMatchAriaSnapshot(`
      - text: Passwort wiederholen
      - textbox: 1Password
    `)
  })

  test("should display errors and work correctly", async ({ page }) => {
    await page.goto("/register")
    const main = page.getByRole("main")
    await expect(main).toBeVisible()

    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(main).toMatchAriaSnapshot(`
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
        - checkbox "Ich akzeptiere die Nutzungsbedingungen."
        - text: Ich akzeptiere die
        - link "Nutzungsbedingungen"
        - text: .
        - button "Registrieren"
        - text: Bereits registriert?
        - link "Anmelden"
    `)

    const id = uuidv4()
    const name = `user-${id}`
    const email = `${name}@test.test`

    await page.locator("#email").fill(email)
    await page.locator("#name").fill(name)
    await page.locator("#password").fill("1Password")
    await page.locator("#confirmPassword").fill("1Password")
    await page.getByLabel("Ich akzeptiere die").click()
    await expect(main).toMatchAriaSnapshot(`
      - main:
        - heading "Registrieren" [level=3]
        - paragraph: Gib deine E-Mail Adresse an und lege deinen Benutzernamen und dein Passwort fest.
        - text: E-Mail
        - textbox: ${email}
        - text: Nutzername
        - textbox: ${name}
        - text: Passwort
        - textbox: 1Password
        - text: Passwort wiederholen
        - textbox: 1Password
        - checkbox "Ich akzeptiere die Nutzungsbedingungen."
        - text: Ich akzeptiere die
        - link "Nutzungsbedingungen"
        - text: .
        - button "Registrieren"
        - text: Bereits registriert?
        - link "Anmelden"
    `)

    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page).toHaveURL("/profile")

    await page.goto("/register")
    await expect(page).toHaveURL("/profile")
  })
})
