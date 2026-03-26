import { test, expect } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"

test.use({ storageState: "tests/e2e/.auth/admin.json" })

const LEGAL_SLUGS = ["privacy-policy", "terms-of-service", "imprint"] as const

test.describe("Legal Page — read", () => {
  for (const slug of LEGAL_SLUGS) {
    test(`renders document: ${slug}`, async ({ page, request }) => {
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })

      const apiResponse = await request.get(`/api/legal/${slug}`)
      expect(apiResponse.ok()).toBeTruthy()
      const legalDocument = await apiResponse.json() as LegalDocumentDetail

      const prose = page.locator("div.prose.dark\\:prose-invert.max-w-full")
      await expect(prose).toBeVisible()
      await expect(prose.locator("h1")).toContainText(legalDocument.name)
      await expect(prose.locator("div")).toContainText(legalDocument.text)
    })
  }
})

test.describe("Legal Page — edit (admin)", () => {
  for (const slug of LEGAL_SLUGS) {
    test(`saves a single update: ${slug}`, async ({ page }) => {
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })
      await page.getByRole("button", { name: "Bearbeiten" }).click()

      const newTitle = `Updated Title ${uuidv4()}`
      const newContent = `Updated content ${uuidv4()}`

      await page.locator("#name").fill(newTitle)
      const editor = page.locator(".ProseMirror")
      await editor.click()
      await editor.fill(newContent)

      await page.getByRole("button", { name: "Speichern" }).scrollIntoViewIfNeeded()
      await page.getByRole("button", { name: "Speichern" }).click()

      const prose = page.locator("div.prose.dark\\:prose-invert.max-w-full").first()
      await expect(prose).toBeVisible()
      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent)
    })

    test(`saves two sequential updates: ${slug}`, async ({ page }) => {
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })

      // First update
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const title1 = `Title-1 ${uuidv4()}`
      const content1 = `Content-1 ${uuidv4()}`
      await page.locator("#name").fill(title1)
      const editor1 = page.locator(".ProseMirror")
      await editor1.click()
      await editor1.fill(content1)
      await page.getByRole("button", { name: "Speichern" }).scrollIntoViewIfNeeded()
      await page.getByRole("button", { name: "Speichern" }).click()

      await expect(page.getByRole("heading")).toContainText(title1)
      await expect(page.getByRole("main")).toContainText(content1)

      // Second update
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const title2 = `Title-2 ${uuidv4()}`
      const content2 = `Content-2 ${uuidv4()}`
      await page.locator("#name").fill(title2)
      const editor2 = page.locator(".ProseMirror")
      await editor2.click()
      await editor2.fill(content2)
      await page.getByRole("button", { name: "Speichern" }).scrollIntoViewIfNeeded()
      await page.getByRole("button", { name: "Speichern" }).click()

      await expect(page.getByRole("heading")).toContainText(title2)
      await expect(page.getByRole("main")).toContainText(content2)
    })

    test(`partial updates (title-only, content-only, no-change): ${slug}`, async ({ page }) => {
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })

      // Establish baseline
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const baseTitle = `Base ${uuidv4()}`
      const baseContent = `Base content ${uuidv4()}`
      await page.locator("#name").fill(baseTitle)
      const editor = page.locator(".ProseMirror")
      await editor.click()
      await editor.fill(baseContent)
      await page.getByRole("button", { name: "Speichern" }).scrollIntoViewIfNeeded()
      await page.getByRole("button", { name: "Speichern" }).click()
      await expect(page.getByRole("heading")).toContainText(baseTitle)

      // Update content only
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const newContent = `New content ${uuidv4()}`
      const editor2 = page.locator(".ProseMirror")
      await editor2.click()
      await editor2.fill(newContent)
      await page.getByRole("button", { name: "Speichern" }).scrollIntoViewIfNeeded()
      await page.getByRole("button", { name: "Speichern" }).click()
      await expect(page.getByRole("heading")).toContainText(baseTitle) // title unchanged
      await expect(page.getByRole("main")).toContainText(newContent)

      // Update title only
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const newTitle = `New title ${uuidv4()}`
      await page.locator("#name").fill(newTitle)
      await page.getByRole("button", { name: "Speichern" }).scrollIntoViewIfNeeded()
      await page.getByRole("button", { name: "Speichern" }).click()
      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent) // content unchanged

      // No changes — save should still succeed
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      await page.getByRole("button", { name: "Speichern" }).scrollIntoViewIfNeeded()
      await page.getByRole("button", { name: "Speichern" }).click()
      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent)
    })
  }
})
