import { expect, type Page } from "@playwright/test"
import { generateTOTP } from "@epic-web/totp"

const TEST_2FA_SECRET = "JBSWY3DPEHPK3PXP"

/**
 * Performs a full login including the mandatory 2FA challenge.
 */
export async function loginWith2fa(page: Page, email: string, password: string = "password") {
  await page.goto("/login", { waitUntil: "networkidle" })
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(password)
  await page.getByRole("button", { name: "Anmelden" }).click()

  await expect(page).toHaveURL("/2fa/challenge")

  const { otp } = await generateTOTP({
    secret: TEST_2FA_SECRET,
    algorithm: "SHA-1",
    digits: 6,
    period: 30
  })

  const twofaInput = page.locator('input[placeholder="123456 oder ABCDE-12345"]')
  await twofaInput.fill(otp)
  await twofaInput.press("Enter")

  await expect(page).toHaveURL("/profile")
}
