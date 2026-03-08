import { expect, type Page } from "@playwright/test"
import { generateTOTP } from "@epic-web/totp"

export async function loginWith2fa(page: Page) {
  const TEST_2FA_SECRET = "JBSWY3DPEHPK3PXP"
  let verified = false

  await page.route("**/api/2fa/status*", async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        authenticated: true,
        enabled: true,
        verified,
      },
    })
  })

  await page.route("**/api/2fa/challenge", async (route) => {
    if (route.request().method() === "POST") {
      verified = true

      await route.fulfill({
        status: 200,
        json: { verified: true },
      })
    }
  })

  await page.getByRole("button", { name: "Anmelden" }).click()

  await page.waitForURL(url => url.pathname.includes("/2fa/challenge"))

  const codeInput = page.getByLabel("Code / Key")
  await expect(codeInput).toBeVisible()

  const { otp } = await generateTOTP({
    secret: TEST_2FA_SECRET,
    algorithm: "SHA-1",
    digits: 6,
    period: 30,
  })

  await codeInput.fill(otp)

  await Promise.all([
    page.waitForURL("**/profile"),
    page.getByRole("button", { name: "Bestätigen" }).click(),
  ])
}
