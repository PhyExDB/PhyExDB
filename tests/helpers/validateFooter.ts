import type { Page } from "@playwright/test"
import { expect } from "@nuxt/test-utils/playwright"

/**
 * Validates the footer section of a web page.
 *
 * @param page - The Playwright Page object representing the web page.
 *
 * @remarks
 * This function performs the following checks:
 * - Ensures the footer is visible.
 * - Verifies the current year is displayed in the footer.
 * - Checks the presence and correctness of specific footer links and their URLs.
 * - Ensures the GitHub link is visible, has the correct URL, and opens in a new tab.
 * - Verifies the presence of the GitHub icon within the GitHub link.
 *
 * @example
 * ```typescript
 * import { validateFooter } from './helpers/validateFooter';
 * import { test, expect } from '@nuxt/test-utils/playwright';
 *
 * test('validate footer', async ({ page }) => {
 *   await page.goto('https://example.com');
 *   await validateFooter(page);
 * });
 * ```
 */
export async function validateFooter(page: Page): Promise<void> {
  // Locate the footer
  const footer = page.locator("footer.bg-muted.text-muted-foreground")
  await expect(footer).toBeVisible()

  // Verify current year is displayed
  const currentYear = new Date().getFullYear().toString()
  await expect(footer.locator("p")).toContainText(`© ${currentYear} PhyExDB`)

  // Verify links and their text
  const links = footer.locator("ul li a")
  const linkTexts = [
    "Nutzungsbedingungen",
    "Impressum",
    "Datenschutzerklärung",
  ]
  const linkUrls = [
    "/terms-of-service",
    "/imprint",
    "/privacy-policy",
  ]

  for (let i = 0; i < linkTexts.length; i++) {
    const link = links.nth(i)
    await expect(link).toHaveText(linkTexts[i]!)
    await expect(link).toHaveAttribute("href", linkUrls[i]!)
  }

  // Verify the GitHub link
  const githubLink = footer.locator("a[href=\"https://github.com/PhyExDB/PhyExDB\"]")
  await expect(githubLink).toBeVisible()
  await expect(githubLink).toHaveAttribute("target", "_blank")

  // Verify the GitHub icon exists
  const githubIcon = githubLink.locator("span.iconify.i-uil\\:github")
  await expect(githubIcon).toBeVisible()
}
