import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
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

      const legalContent = proseContent.locator("p")
      expect(await legalContent.textContent()).toContain(legalDocument!.text)
      await expect(legalContent).toBeVisible()
    })
  })
})
