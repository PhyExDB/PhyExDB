import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test.describe("Profile Page", () => {
  test("should show verified badge when email is verified", async ({ page }) => {
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" })
    await page.locator("#email").click()
    await page.locator("#email").fill("user@test.test")
    await page.locator("#email").press("Tab")
    await page.locator("#password").fill("password")
    await page.locator("#password").press("Tab")
    await page.getByRole("button", { name: "Anmelden" }).press("Enter")
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - text: US
      - paragraph: User
      - paragraph: user@test.test
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
      `)
    await expect(page.locator("div").filter({ hasText: /^user@test\.test$/ }).locator("span")).toBeVisible()
    await page.locator("div").filter({ hasText: /^user@test\.test$/ }).locator("span").click()
    await expect(page.locator("#radix-vue-popover-content-v-1-4-2")).toBeVisible()
    await expect(page.locator("#radix-vue-popover-content-v-1-4-2")).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist verifiziert
      `)
  })

  test("should show unverified badge when email is not verified", async ({ page }) => {
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" })
    await page.locator("#email").click()
    await page.locator("#email").fill("unverified@test.test")
    await page.locator("#email").press("Tab")
    await page.locator("#password").fill("password")
    await page.locator("#password").press("Enter")
    await page.locator("#password").press("Tab")
    await page.getByRole("button", { name: "Anmelden" }).press("Enter")
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - text: UU
      - paragraph: Unverified User
      - paragraph: unverified@test.test
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
      `)
    await expect(page.locator("div").filter({ hasText: /^unverified@test\.test$/ }).locator("span")).toBeVisible()
    await page.locator("div").filter({ hasText: /^unverified@test\.test$/ }).locator("span").click()
    await expect(page.locator("#radix-vue-popover-content-v-1-4-2")).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist nicht verifiziert
        - button "E-Mail verifizieren"
      `)
  })

  test("change name and email flow should work", async ({ page }) => {
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle" })

    const id = uuidv4()
    const username = `changeme-${id}`
    const email = `${username}@test.test`

    await page.locator("#email").click()
    await page.locator("#email").fill(email)
    await page.locator("#email").press("Tab")
    await page.locator("#username").fill(username)
    await page.locator("#username").press("Tab")
    await page.locator("#password").fill("1Password")
    await page.locator("#password").press("Tab")
    await page.locator("#confirmPassword").fill("1Password")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - text: CH
      - paragraph: ${username}
      - paragraph: ${email}
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
      `)
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Name oder E-Mail ändern" }).click()
    await expect(page.getByLabel("Nutzername oder E-Mail ändern")).toMatchAriaSnapshot(`
      - dialog "Nutzername oder E-Mail ändern":
        - heading "Nutzername oder E-Mail ändern" [level=2]
        - paragraph: Ändere deinen Nutzernamen oder deine E-Mail Adresse.
        - textbox: ${username}
        - textbox: ${email}
        - button "Speichern"
        - button "Close":
          - img
      `)
    await page.locator("#username").dblclick()
    await page.locator("#username").fill("")
    await page.locator("#email").dblclick()
    await page.locator("#email").fill("")
    await expect(page.getByLabel("Nutzername oder E-Mail ändern")).toMatchAriaSnapshot(`
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
    await page.locator("#username").click()
    const username2 = `changeme2-${id}`
    const email2 = `${username2}@test.test`
    await page.locator("#username").fill(username2)
    await page.locator("#username").press("Tab")
    await page.locator("#email").fill(username2)
    await expect(page.getByLabel("Nutzername oder E-Mail ändern")).toMatchAriaSnapshot(`
      - dialog "Nutzername oder E-Mail ändern":
        - heading "Nutzername oder E-Mail ändern" [level=2]
        - paragraph: Ändere deinen Nutzernamen oder deine E-Mail Adresse.
        - textbox: ${username2}
        - textbox: ${username2}
        - alert: Invalide E-Mail-Adresse
        - button "Speichern"
        - button "Close":
          - img
      `)
    await page.locator("#email").click()
    await page.locator("#email").fill(email2)
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - text: CH
      - paragraph: ${username2}
      - paragraph: ${email2}
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
      `)
  })

  test("change password flow should work", async ({ page }) => {
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle" })

    const id = uuidv4()
    const username = `changeme-${id}`
    const email = `${username}@test.test`

    await page.locator("#email").click()
    await page.locator("#email").fill(email)
    await page.locator("#email").press("Tab")
    await page.locator("#username").fill(username)
    await page.locator("#username").press("Tab")
    await page.locator("#password").fill("1Password")
    await page.locator("#password").press("Tab")
    await page.locator("#confirmPassword").fill("1Password")
    await page.getByRole("button", { name: "Registrieren" }).click()
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - text: CH
      - paragraph: ${username}
      - paragraph: ${email}
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
      `)
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Passwort ändern" }).click()
    await expect(page.getByLabel("Passwort ändern")).toMatchAriaSnapshot(`
      - dialog "Passwort ändern":
        - heading "Passwort ändern" [level=2]
        - paragraph: Ändere dein Passwort.
        - text: Aktuelles Passwort
        - textbox
        - textbox
        - text: Neues Passwort wiederholen
        - textbox
        - button "Speichern"
        - button "Close":
          - img
      `)
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.getByLabel("Passwort ändern")).toMatchAriaSnapshot(`
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
    await page.locator("#oldPassword").click()
    await page.locator("#oldPassword").fill("Wrong")
    await page.locator("#oldPassword").press("Tab")
    await page.locator("#password").fill("pass")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Neues Passwort
      - textbox: pass
      - alert: Passwort muss mindestens 8 Zeichen lang sein
      `)
    await page.locator("#password").click()
    await page.locator("#password").fill("password")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Neues Passwort
      - textbox: password
      - alert: Passwort muss mindestens einen Grossbuchstaben enthalten
      `)
    await page.locator("#password").click()
    await page.locator("#password").press("ControlOrMeta+ArrowLeft")
    await page.locator("#password").fill("Password")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Neues Passwort
      - textbox: Password
      - alert: Passwort muss mindestens eine Zahl enthalten
      `)
    await page.locator("#password").click()
    await page.locator("#password").fill("2Password")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Neues Passwort
      - textbox: 2Password
      `)
    await page.locator("#confirmPassword").click()
    await page.locator("#confirmPassword").fill("2Pass")
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Neues Passwort wiederholen
      - textbox: 2Pass
      - alert: Passwörter stimmen nicht überein
      `)
    await page.locator("#confirmPassword").click()
    await page.locator("#confirmPassword").fill("2Password")
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.locator("form")).toMatchAriaSnapshot(`
      - text: Aktuelles Passwort
      - textbox: Wrong
      - alert: Das Passwort ist falsch
      `)
    await page.locator("#oldPassword").click()
    await page.locator("#oldPassword").fill("1Password")
    await page.getByRole("button", { name: "Speichern" }).click()
  })
})
