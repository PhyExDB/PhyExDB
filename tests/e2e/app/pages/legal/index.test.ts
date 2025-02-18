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
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })

      const apiResponse = await request.get(`/api/legal/${slug}`)
      expect(apiResponse.ok()).toBeTruthy()

      const legalDocument = await apiResponse.json() as LegalDocumentDetail

      const proseContent = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent).toBeVisible()

      const heading = proseContent.locator("h1")
      expect(await heading.textContent()).toContain(legalDocument!.name)
      await expect(heading).toBeVisible()
      // test um Inhalt zu prüfen ...
      const content = proseContent.locator("div")
      expect(await content.innerHTML()).toContain(legalDocument!.text)
      await expect(content).toBeVisible()
    })

    test(`should update the legal documents once for ${slug}`, async ({ page }) => {
      await page.goto("/login", { waitUntil: "networkidle" })
      // log in as administrator
      await page.locator("#email").fill("admin@test.test")
      await page.locator("#password").fill("password")
      await page.getByRole("button", { name: "Anmelden" }).click()
      await page.waitForNavigation({ waitUntil: "networkidle" })
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })
      await page.getByRole("button", { name: "Bearbeiten" }).click()

      const newTitle = `updated Legal Document ${uuidv4()}`
      const newContent = `updated Legal for testing purposes ${uuidv4()}`

      await page.locator("#name").fill(newTitle)
      // await page.locator("#text").getByText("Inhalt").fill(newContent)
      const editor = page.locator(".ProseMirror")
      editor.click()
      editor.fill(newContent)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent2 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent2).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent)
    })

    test(`should update the legal documents twice for ${slug}`, async ({ page }) => {
      await page.goto("/login", { waitUntil: "networkidle" })
      // log in as administrator
      await page.locator("#email").fill("admin@test.test")
      await page.locator("#password").fill("password")
      await page.getByRole("button", { name: "Anmelden" }).click()
      await page.waitForNavigation({ waitUntil: "networkidle" })
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })
      await page.getByRole("button", { name: "Bearbeiten" }).click()

      const newTitle = `updated Legal Document ${uuidv4()}`
      const newContent = `updated Legal for testing purposes ${uuidv4()}`

      await page.locator("#name").fill(newTitle)
      const editor = page.locator(".ProseMirror")
      editor.click()
      editor.fill(newContent)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent2 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent2).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent)

      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const newTitle2 = `test2 ${uuidv4()}`
      const newContent2 = `test2 content ${uuidv4()}`

      await page.locator("#name").fill(newTitle2)
      const editor2 = page.locator(".ProseMirror")
      editor2.click()
      editor2.fill(newContent2)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent3 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent3).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle2)
      await expect(page.getByRole("main")).toContainText(newContent2)
    })
    test(`should update the legal documents for Title and Content and updates the legal document with only text/title for ${slug}`, async ({ page }) => {
      await page.goto("/login", { waitUntil: "networkidle" })
      // log in as administrator
      await page.locator("#email").fill("admin@test.test")
      await page.locator("#password").fill("password")
      await page.getByRole("button", { name: "Anmelden" }).click()
      await page.waitForNavigation({ waitUntil: "networkidle" })
      await page.goto(`/legal/${slug}`, { waitUntil: "networkidle" })
      await page.getByRole("button", { name: "Bearbeiten" }).click()

      const newTitle = `updated Legal Document ${uuidv4()}`
      const newContent = `updated Legal for testing purposes ${uuidv4()}`

      await page.locator("#name").fill(newTitle)
      const editor = page.locator(".ProseMirror")
      editor.click()
      editor.fill(newContent)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent2 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent2).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent)
      // only change content
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const newContent2 = `test2 content ${uuidv4()}`

      const editor2 = page.locator(".ProseMirror")
      editor2.click()
      editor2.fill(newContent2)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent3 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent3).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle)
      await expect(page.getByRole("main")).toContainText(newContent2)

      // only change Title
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      const newTitle2 = `test2 content ${uuidv4()}`

      await page.locator("#name").fill(newTitle2)
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent4 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent4).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle2)
      await expect(page.getByRole("main")).toContainText(newContent2)

      // no changes at all
      await page.getByRole("button", { name: "Bearbeiten" }).click()
      await page.getByRole("button", { name: "Speichern" }).click()

      const proseContent5 = page.locator("div[class=\"prose dark:prose-invert\"]")
      await expect(proseContent5).toBeVisible()

      await expect(page.getByRole("heading")).toContainText(newTitle2)
      await expect(page.getByRole("main")).toContainText(newContent2)
    })
  })
})
