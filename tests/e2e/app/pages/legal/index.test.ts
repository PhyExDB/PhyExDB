import { test, expect } from "@nuxt/test-utils/playwright"
import { $fetch } from "@nuxt/test-utils/e2e"

test.describe("Homepage", () => {
  [
    "privacy-policy",
    "terms-of-service",
    "imprint",
  ].forEach((slug) => {
    test(`should render the legal document with slug ${slug}`, async ({ page, goto }) => {
      // Navigate to the homepage
      await goto(`/${slug}`, { waitUntil: "hydration" })

      const legalDocument = await $fetch(`/api/legal/${slug}`)

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
