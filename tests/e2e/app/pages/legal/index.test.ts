import { test, expect, type Page } from "@playwright/test"
import { v4 as uuidv4 } from "uuid"
import type { LegalDocumentDetail } from "#shared/types"

test.describe("Legal Page", () => {
  const slugs = [
    "privacy-policy",
    "terms-of-service",
    "imprint",
  ]

  for (const slug of slugs) {
    test(`should render the legal document with slug ${slug}`, async ({ page, request }) => {
      await page.goto(`/legal/${slug}`)

      const apiResponse = await request.get(`/api/legal/${slug}`)
      expect(apiResponse.ok()).toBeTruthy()

      const legalDocument = await apiResponse.json()

      const proseContent = page.locator("div.prose")
      await expect(proseContent).toBeVisible()

      const heading = proseContent.locator("h1")
      await expect(heading).toBeVisible()
      await expect(heading).toContainText(legalDocument.name)

      const content = proseContent.locator("div")
      await expect(content).toBeVisible()
      await expect(content).toContainText(legalDocument.text)
    })

    test(`should update the legal document once for ${slug}`, async ({ page }) => {
      await loginAsAdmin(page)

      await page.goto(`/legal/${slug}`)
      await page.getByRole("button", { name: "Bearbeiten" }).click()

      const newTitle = `updated Legal ${uuidv4()}`
      const newContent = `updated Content ${uuidv4()}`

      await page.locator("#name").fill(newTitle)

      const editor = page.locator(".ProseMirror")
      await editor.click()
      await editor.fill(newContent)

      await page.getByRole("button", { name: "Speichern" }).click()

      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent)
    })

    test(`should update the legal document twice for ${slug}`, async ({ page }) => {
      await loginAsAdmin(page)

      await page.goto(`/legal/${slug}`)
      await page.getByRole("button", { name: "Bearbeiten" }).click()

      const title1 = `title-1 ${uuidv4()}`
      const content1 = `content-1 ${uuidv4()}`

      await page.locator("#name").fill(title1)
      await page.locator(".ProseMirror").fill(content1)
      await page.getByRole("button", { name: "Speichern" }).click()

      await expect(page.getByRole("heading")).toContainText(title1)
      await expect(page.getByRole("main")).toContainText(content1)

      await page.getByRole("button", { name: "Bearbeiten" }).click()

      const title2 = `title-2 ${uuidv4()}`
      const content2 = `content-2 ${uuidv4()}`

      await page.locator("#name").fill(title2)
      await page.locator(".ProseMirror").fill(content2)
      await page.getByRole("button", { name: "Speichern" }).click()

      await expect(page.getByRole("heading")).toContainText(title2)
      await expect(page.getByRole("main")).toContainText(content2)
    })

    test(`should update title/content independently for ${slug}`, async ({ page }) => {
      await loginAsAdmin(page)

      await page.goto(`/legal/${slug}`)
      await page.getByRole("button", { name: "Bearbeiten" }).click()

      const title = `initial ${uuidv4()}`
      const content = `initial content ${uuidv4()}`

      await page.locator("#name").fill(title)
      await page.locator(".ProseMirror").fill(content)
      await page.getByRole("button", { name: "Speichern" }).click()

      // Update only content
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const content2 = `content-2 ${uuidv4()}`
      await page.locator(".ProseMirror").fill(content2)
      await page.getByRole("button", { name: "Speichern" }).click()

      await expect(page.getByRole("heading")).toContainText(title)
      await expect(page.getByRole("main")).toContainText(content2)

      // Update only title
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const title2 = `title-2 ${uuidv4()}`
      await page.locator("#name").fill(title2)
      await page.getByRole("button", { name: "Speichern" }).click()

      await expect(page.getByRole("heading")).toContainText(title2)
      await expect(page.getByRole("main")).toContainText(content2)

      // Save without changes
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      await page.getByRole("button", { name: "Speichern" }).click()

      await expect(page.getByRole("heading")).toContainText(title2)
      await expect(page.getByRole("main")).toContainText(content2)
    })
  }
})

async function loginAsAdmin(page: Page) {
  await page.goto("/login")
  await page.locator("#email").fill("admin@test.test")
  await page.locator("#password").fill("password")
  await page.getByRole("button", { name: "Anmelden" }).click()
  await expect(page.getByRole("main")).toBeVisible()
}
