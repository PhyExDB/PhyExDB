import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test("Test verification working", async ({ page }) => {
  const id = uuidv4()
  const name = `user-${id}`
  const email = `${name}@test.test`

  await page.goto("/register", { waitUntil: "networkidle" })
  await page.locator("#email").click()
  await page.locator("#email").fill(email)
  await page.locator("#email").press("Tab")
  await page.locator("#name").fill(name)
  await page.locator("#name").press("Tab")
  await page.locator("#password").fill("1Passwort")
  await page.locator("#password").press("Tab")
  await page.locator("#confirmPassword").fill("1Passwort")
  await page.getByLabel("Ich akzeptiere die").click()
  await page.getByRole("button", { name: "Registrieren" }).click()
  await page.goto("http://localhost:8025/")
  await page.getByRole("link", { name: `email@email.com To: ${name}` }).click()
  const page1Promise = page.waitForEvent("popup")
  await page.getByRole("link", { name: "http://localhost:3000/api/" }).click()
  const page1 = await page1Promise
  await page1.getByRole("button", { name: "US" }).click()
  await page1.getByRole("link", { name: "Profil" }).click()
  await expect(page.locator("div").filter({ hasText: email }).locator("span")).toBeVisible()
  await page.locator("div").filter({ hasText: email }).locator("span").click()
  await expect(page.locator("[id^='radix-vue-popover-content']")).toBeVisible()
  await expect(page.locator("[id^='radix-vue-popover-content']")).toMatchAriaSnapshot(`
      - dialog:
        - paragraph: E-Mail ist verifiziert
      `)
})
