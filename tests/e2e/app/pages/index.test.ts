import { test } from "@nuxt/test-utils/playwright"
import { validateFooter } from "~~/tests/helpers/validateFooter"

test.describe("Homepage", () => {
  test("should render the footer with correct content", async ({ page, goto }) => {
    // Navigate to the homepage
    await goto("/", { waitUntil: "hydration" })
    // Validate the footer
    await validateFooter(page)
  })
})
