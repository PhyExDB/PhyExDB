import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test.describe("Profile Page", () => {
  test("should show verified badge when email is verified", async ({ page }) => {
    await page.goto("/login")
    await page.locator("#email").fill("user@test.test")
    await page.locator("#password").fill("password")
    await page.getByRole("button", { name: "Anmelden" }).click()

    const main = page.getByRole("main")
    await expect(main).toBeVisible()
    await expect(main).toMatchAriaSnapshot(`
      - text: US
      - paragraph: User
      - paragraph: user@test.test
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
    `)

    const emailBadge = page.locator("div").filter({ hasText: /^user@test\.test$/ }).locator("span")
    await expect(emailBadge).toBeVisible()
    await emailBadge.click()
    const popover = page.locator("[id^='radix-vue-popover-content']")
    await expect(popover).toBeVisible()
    await expect(popover).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist verifiziert
    `)
  })

  test("should show unverified badge when email is not verified", async ({ page }) => {
    await page.goto("/login")
    await page.locator("#email").fill("unverified@test.test")
    await page.locator("#password").fill("password")
    await page.getByRole("button", { name: "Anmelden" }).click()

    const main = page.getByRole("main")
    await expect(main).toBeVisible()
    await expect(main).toMatchAriaSnapshot(`
      - text: UN
      - paragraph: Unverified
      - paragraph: unverified@test.test
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
    `)

    const emailBadge = page.locator("div").filter({ hasText: /^unverified@test\.test$/ }).locator("span")
    await expect(emailBadge).toBeVisible()
    await emailBadge.click()
    const popover = page.locator("[id^='radix-vue-popover-content']")
    await expect(popover).toBeVisible()
    await expect(popover).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist nicht verifiziert
        - button "E-Mail verifizieren"
    `)
  })

  test("change name and email flow should work", async ({ page }) => {
    const id = uuidv4()
    const name = `changeme-${id}`
    const email = `${name}@test.test`

    await page.goto("/register")
    await page.locator("#email").fill(email)
    await page.locator("#name").fill(name)
    await page.locator("#password").fill("1Password")
    await page.locator("#confirmPassword").fill("1Password")
    await page.getByLabel("Ich akzeptiere die").click()
    await page.getByRole("button", { name: "Registrieren" }).click()

    const main = page.getByRole("main")
    await expect(main).toBeVisible()
    await expect(main).toMatchAriaSnapshot(`
      - text: CH
      - paragraph: ${name}
      - paragraph: ${email}
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
    `)

    await page.getByRole("button", { name: "Name oder E-Mail ändern" }).click()
    const dialog = page.getByLabel("Nutzername oder E-Mail ändern")
    await expect(dialog).toBeVisible()

    // Invalid submission
    await page.locator("#name").fill("")
    await page.locator("#email").fill("")
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(dialog).toMatchAriaSnapshot(`
      - dialog "Nutzername oder E-Mail ändern":
        - heading "Nutzername oder E-Mail ändern" [level=2]
        - paragraph: Ändere deinen Nutzernamen oder deine E-Mail Adresse.
        - textbox
        - alert: Nutzername muss angegeben werden
        - textbox
        - alert: E-Mail-Adresse muss angegeben werden
        - button "Speichern"
        - button "Close":
          - img
    `)

    // Correct submission
    const name2 = `changeme2-${id}`
    const email2 = `${name2}@test.test`
    await page.locator("#name").fill(name2)
    await page.locator("#email").fill(email2)
    await page.getByRole("button", { name: "Speichern" }).click()

    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - text: CH
      - paragraph: ${name2}
      - paragraph: ${email2}
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
    `)

    await expect(page.getByRole("alert", { name: "Account aktualisiert" })).toBeVisible()
  })

  test("change password flow should work", async ({ page }) => {
    const id = uuidv4()
    const name = `changeme-${id}`
    const email = `${name}@test.test`

    await page.goto("/register")
    await page.locator("#email").fill(email)
    await page.locator("#name").fill(name)
    await page.locator("#password").fill("1Password")
    await page.locator("#confirmPassword").fill("1Password")
    await page.getByLabel("Ich akzeptiere die").click()
    await page.getByRole("button", { name: "Registrieren" }).click()

    await page.getByRole("button", { name: "Passwort ändern" }).click()
    const dialog = page.getByLabel("Passwort ändern")
    await expect(dialog).toBeVisible()

    // Submit empty
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(dialog).toMatchAriaSnapshot(`
      - dialog "Passwort ändern":
        - heading "Passwort ändern" [level=2]
        - paragraph: Ändere dein Passwort.
        - text: Aktuelles Passwort
        - textbox
        - alert: Altes Passwort muss angegeben werden
        - textbox
        - alert: Passwort muss angegeben werden
        - text: Neues Passwort wiederholen
        - textbox
        - alert: Passwort muss wiederholt werden
        - button "Speichern"
        - button "Close":
          - img
    `)

    // Invalid old password / invalid new password
    await page.locator("#oldPassword").fill("Wrong")
    await page.locator("#password").fill("pass")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Neues Passwort
      - textbox: pass
      - alert: Passwort muss mindestens 8 Zeichen lang sein
    `)

    await page.locator("#password").fill("Password")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Neues Passwort
      - textbox: Password
      - alert: Passwort muss mindestens eine Zahl enthalten
    `)

    await page.locator("#password").fill("2Password")
    await page.locator("#confirmPassword").fill("2Pass")
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Neues Passwort wiederholen
      - textbox: 2Pass
      - alert: Passwörter stimmen nicht überein
    `)

    await page.locator("#confirmPassword").fill("2Password")
    await page.locator("#oldPassword").fill("1Password")
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.getByRole("alert", { name: "Passwort geändert" })).toBeVisible()
  })

  test("dialogs should be closable", async ({ page }) => {
    await page.goto("/login")
    await page.locator("#email").fill("user@test.test")
    await page.locator("#password").fill("password")
    await page.getByRole("button", { name: "Anmelden" }).click()

    const main = page.getByRole("main")
    await expect(main).toBeVisible()

    // Open / Close Name or Email dialog
    await page.getByRole("button", { name: "Name oder E-Mail ändern" }).click()
    const nameEmailDialog = page.getByLabel("Nutzername oder E-Mail ändern")
    await expect(nameEmailDialog).toBeVisible()
    await page.getByRole("button", { name: "Close" }).click()
    await expect(nameEmailDialog).not.toBeVisible()

    // Open / Close Password dialog
    await page.getByRole("button", { name: "Passwort ändern" }).click()
    const passwordDialog = page.getByLabel("Passwort ändern")
    await expect(passwordDialog).toBeVisible()
    await page.getByRole("button", { name: "Close" }).click()
    await expect(passwordDialog).not.toBeVisible()
  })
})
