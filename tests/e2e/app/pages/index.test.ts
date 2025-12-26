import { test } from "@playwright/test"
import { validateFooter } from "~~/tests/helpers/validateFooter"

test.describe("Homepage", () => {
  test("should render the footer with correct content", async ({ page }) => {
    await page.goto("/")
    await validateFooter(page)
  })
})
