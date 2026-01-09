import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test.describe("E-Mail verification", () => {
  test("should work", async ({ page }) => {
    const id = uuidv4()
    const name = `user-${id}`
    const email = `${id}@test.test`
    const emailRegex = new RegExp(`^${id}@test\\.test$`)

    await page.goto("/register")
    await expect(page.locator("#email")).toBeVisible()

    await page.locator("#email").fill(email)
    await page.locator("#name").fill(name)
    await page.locator("#password").fill("1Passwort")
    await page.locator("#confirmPassword").fill("1Passwort")
    await page.getByLabel("Ich akzeptiere die").click()

    await page.getByRole("button", { name: "Registrieren" }).click()

    await expect(
      page.locator("div").filter({ hasText: emailRegex }).locator("span"),
    ).toBeVisible()

    await page
      .locator("div")
      .filter({ hasText: emailRegex })
      .locator("span")
      .click()

    await expect(
      page.locator("[id^='radix-vue-popover-content']"),
    ).toBeVisible()

    await expect(
      page.locator("[id^='radix-vue-popover-content']"),
    ).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist nicht verifiziert
        - button "E-Mail verifizieren"
    `)

    await page.goto("http://localhost:8025/")
    await expect(
      page.getByRole("link", { name: new RegExp(`To: ${email}`) }),
    ).toBeVisible()

    await page.getByRole("link", { name: new RegExp(`To: ${email}`) }).click()

    const [page1] = await Promise.all([
      page.waitForEvent("popup"),
      page
        .locator("#preview-html")
        .contentFrame()
        .getByRole("link", { name: "E-Mail bestätigen" })
        .click(),
    ])

    await page1.goto("/profile")
    await expect(page1.getByRole("main")).toBeVisible()

    await expect(page1.getByRole("main")).toMatchAriaSnapshot(`
      - text: US
      - paragraph: ${name}
      - paragraph: ${email}
      - button "Name oder E-Mail ändern"
      - button "Passwort ändern"
    `)

    await expect(
      page1.locator("div").filter({ hasText: emailRegex }).locator("span"),
    ).toBeVisible()

    await page1
      .locator("div")
      .filter({ hasText: emailRegex })
      .locator("span")
      .click()

    await expect(
      page1.locator("[id^='radix-vue-popover-content']"),
    ).toBeVisible()

    await expect(
      page1.locator("[id^='radix-vue-popover-content']"),
    ).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist verifiziert
    `)
  })
})
