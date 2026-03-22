import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test.describe("Profile Page — read (stored auth)", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" })

  test("shows verified badge for verified email", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "networkidle" })

    const emailDiv = page.locator("div").filter({ hasText: /^user@test\.test$/ })
    await expect(emailDiv).toBeVisible({ timeout: 10_000 })

    const verifyIcon = emailDiv.locator("span").first()
    await expect(verifyIcon).toBeVisible({ timeout: 10_000 })
    await verifyIcon.click()

    const popover = page.locator("[id^='radix-vue-popover-content']")
    await expect(popover).toBeVisible({ timeout: 10_000 })
    await expect(popover).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist verifiziert
    `)
  })

  test("dialogs can be opened and closed", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "networkidle" })

    await page.getByRole("button", { name: "Name oder E-Mail ändern" }).click()
    const updateDialog = page.getByLabel("Nutzername oder E-Mail ändern")
    await expect(updateDialog).toBeVisible({ timeout: 10_000 })
    await page.getByRole("button", { name: "Close" }).click()
    await expect(updateDialog).not.toBeVisible()

    await page.getByRole("button", { name: "Passwort ändern" }).click()
    const passwordDialog = page.getByLabel("Passwort ändern")
    await expect(passwordDialog).toBeVisible({ timeout: 10_000 })
    await page.getByRole("button", { name: "Close" }).click()
    await expect(passwordDialog).not.toBeVisible()
  })
})

test.describe("change name and email flow should work", () => {
  async function registerFreshUser(page: import("@playwright/test").Page) {
    const id = uuidv4()
    const name = `test-${id}`
    const email = `${name}@test.test`

    await page.goto("/register", { waitUntil: "networkidle" })
    await page.locator("#email").fill(email)
    await page.locator("#name").fill(name)
    await page.locator("#password").fill("1Password")
    await page.locator("#confirmPassword").fill("1Password")
    await page.getByLabel("Ich akzeptiere die").click()
    await page.getByRole("button", { name: "Registrieren" }).click()
    await page.waitForURL("**/profile", { timeout: 15_000 })
    return { email, name }
  }

  test("shows unverified badge for newly registered user", async ({ page }) => {
    const { email } = await registerFreshUser(page)
    const emailRegex = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)

    const emailDiv = page.locator("div").filter({ hasText: emailRegex })
    await expect(emailDiv).toBeVisible({ timeout: 10_000 })

    const verifyIcon = emailDiv.locator("span").first()
    await expect(verifyIcon).toBeVisible({ timeout: 10_000 })
    await verifyIcon.click()

    const popover = page.locator("[id^='radix-vue-popover-content']")
    await expect(popover).toBeVisible({ timeout: 10_000 })
    await expect(popover).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist nicht verifiziert
        - button "E-Mail verifizieren"
    `)
  })

  test("name and email change flow works", async ({ page }) => {
    const { email, name } = await registerFreshUser(page)

    await page.getByRole("button", { name: "Name oder E-Mail ändern" }).click()
    await expect(page.getByLabel("Nutzername oder E-Mail ändern")).toBeVisible({ timeout: 10_000 })

    // Validate empty fields
    await page.locator("#name").fill("")
    await page.locator("#email").fill("")
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.locator("[id^='radix-vue-dialog-content']")).toContainText("Nutzername muss angegeben werden")
    await expect(page.locator("[id^='radix-vue-dialog-content']")).toContainText("E-Mail-Adresse muss angegeben werden")

    // Set a valid new name + invalid email
    const newName = `updated-${uuidv4()}`
    await page.locator("#name").fill(newName)
    await page.locator("#email").fill("not-an-email")
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.locator("[id^='radix-vue-dialog-content']")).toContainText("Invalide E-Mail-Adresse")

    // Valid new name + valid new email
    const newEmail = `${newName}@test.test`
    await page.locator("#email").fill(newEmail)
    await page.getByRole("button", { name: "Speichern" }).click()

    // Dialog closes and profile reflects new name
    await expect(page.getByRole("main")).toContainText(newName)
    await expect(page.getByRole("main")).toContainText(newEmail)
    await expect(page.getByRole("alert", { name: "Account aktualisiert" })).toBeVisible()

    void email
    void name
  })

  test("password change flow works", async ({ page }) => {
    await registerFreshUser(page)

    await page.getByRole("button", { name: "Passwort ändern" }).click()
    await expect(page.getByLabel("Passwort ändern")).toBeVisible({ timeout: 10_000 })

    // Empty submission validation
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.locator("[id^='radix-vue-dialog-content']")).toContainText("Altes Passwort muss angegeben werden")

    // Wrong current password
    await page.locator("#oldPassword").fill("WrongPassword1")
    await page.locator("#password").fill("2Password")
    await page.locator("#confirmPassword").fill("2Password")
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.locator("[id^='radix-vue-dialog-content']")).toContainText("Das Passwort ist falsch")

    // Correct flow
    await page.locator("#oldPassword").fill("1Password")
    await page.locator("#password").fill("2Password")
    await page.locator("#confirmPassword").fill("2Password")
    await page.getByRole("button", { name: "Speichern" }).click()
    await expect(page.getByRole("alert", { name: "Passwort geändert" })).toBeVisible()
  })

  test("password strength validation is shown inline", async ({ page }) => {
    await registerFreshUser(page)
    await page.getByRole("button", { name: "Passwort ändern" }).click()
    await expect(page.getByLabel("Passwort ändern")).toBeVisible({ timeout: 10_000 })

    await page.locator("#password").fill("pass")
    await expect(page.locator("form")).toContainText("Passwort muss mindestens 8 Zeichen lang sein")

    await page.locator("#password").fill("password")
    await expect(page.locator("form")).toContainText("Passwort muss mindestens einen Grossbuchstaben enthalten")

    await page.locator("#password").fill("Password")
    await expect(page.locator("form")).toContainText("Passwort muss mindestens eine Zahl enthalten")

    await page.locator("#password").fill("1Password")
    await expect(page.locator("form")).not.toContainText("Passwort muss")
  })
})
