import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test.describe("Legal Page", () => {
  [
    "privacy-policy",
    "terms-of-service",
    "imprint",
  ].forEach((slug) => {
    test(`should render the legal document with slug ${slug}`, async ({ page, request }) => {
      // Navigate to the homepage
      await page.goto("/login", { waitUntil: "networkidle" })
      // log in as administrator
      await page.locator("#email").fill("admin@test.test")
      await page.locator("#password").fill("password")
      await page.getByRole("button", { name: "Anmelden" }).click()
      await page.waitForNavigation({ waitUntil: "networkidle" })
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })

      const apiResponse = await request.get(`/api/legal/${slug}`)
      expect(apiResponse.ok()).toBeTruthy()

      const legalDocument = await apiResponse.json() as LegalDocumentDetail

      const proseContent = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent).toBeVisible()

      const heading = proseContent.locator("h1")
      expect(await heading.textContent()).toContain(legalDocument!.name)
      await expect(heading).toBeVisible()

      const legalContent = proseContent.locator("p")
      expect(await legalContent.textContent()).toContain(legalDocument!.text)
      await expect(legalContent).toBeVisible()

      await page.getByRole("button", { name: "edit" }).click()

      const newTitle = `updated Legal Document ${uuidv4()}`
      const newContent = `updated Legal for testing purposes ${uuidv4()}`

      await page.locator("#name").fill(newTitle)
      await page.locator("#text").fill(newContent)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent2 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent2).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent)

      await page.getByRole("button", { name: "edit" }).click()
      const newTitle2 = `test2 ${uuidv4()}`
      const newContent2 = `test2 content ${uuidv4()}`

      await page.locator("#name").fill(newTitle2)
      await page.locator("#text").fill(newContent2)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent3 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent3).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle2)
      await expect(page.getByRole("main")).toContainText(newContent2)
    })
  })
})
