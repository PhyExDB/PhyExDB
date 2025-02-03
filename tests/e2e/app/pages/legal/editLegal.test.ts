import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

const legalSlug = ["privacy-policy", "terms-of-service", "imprint"]
test.describe("Legal Page", () => {
  legalSlug.forEach((slug) => {
    test(`should update legal documents sucessfully with ${slug}`, async ({ page }) => {
    // go to login page
      await page.goto("/login", { waitUntil: "networkidle" })
      // log in as administrator
      await page.locator("#email").fill("admin@test.test")
      await page.locator("#password").fill("password")
      await page.getByRole("button", { name: "Anmelden" }).click()
      await page.waitForNavigation({ waitUntil: "networkidle" })
      // go to legal page
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })
      await page.getByRole("button", { name: "edit" }).click()

      const newTitle = `updated Legal Document ${uuidv4()}`
      const newContent = `updated Legal for testing purposes ${uuidv4()}`

      await page.locator("#name").fill(newTitle)
      await page.locator("#text").fill(newContent)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent)
    })
  })
})
