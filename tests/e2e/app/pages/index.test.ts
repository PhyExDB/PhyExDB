import { test } from "@playwright/test"
import { validateFooter } from "~~/tests/helpers/validateFooter"

test.describe("Homepage", () => {
  test("should render the footer with correct content", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/", { waitUntil: "networkidle" })
    // Validate the footer
    await validateFooter(page)
  })
})
