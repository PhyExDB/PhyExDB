import fs from "fs/promises"
import path from "path"
import { chromium, type FullConfig } from "@playwright/test"
import { generateTotpCode } from "../helpers/totp"

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

export const AUTH_DIR = path.join(process.cwd(), "tests/e2e/.auth")
export const ADMIN_TOTP_SECRET_FILE = path.join(AUTH_DIR, "admin-totp-secret.txt")

async function globalSetup(_config: FullConfig) {
  await fs.mkdir(AUTH_DIR, { recursive: true })

  const browser = await chromium.launch()

  try {
    await Promise.all([
      setupRoleAuth(browser, "user@test.test", "password", path.join(AUTH_DIR, "user.json")),
      setupRoleAuth(browser, "moderator@test.test", "password", path.join(AUTH_DIR, "moderator.json")),
    ])

    await setupAdminAuth(browser)
  } finally {
    await browser.close()
  }
}

/**
 * Logs in via the BetterAuth API directly (bypasses UI) and saves the browser storage state.
 */
async function setupRoleAuth(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  email: string,
  password: string,
  outputFile: string,
) {
  const context = await browser.newContext()

  try {
    const response = await context.request.post(`${BASE_URL}/api/auth/sign-in/email`, {
      data: { email, password },
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok()) {
      throw new Error(`Login failed for ${email}: ${response.status()} ${await response.text()}`)
    }

    await context.storageState({ path: outputFile })
  } finally {
    await context.close()
  }
}

/**
 * Logs in as admin via API, enables 2FA if needed, completes the challenge, then saves
 * two storage-state files:
 *
 *  admin-session-only.json — session cookie present, no twofa_verified cookie.
 *                             Used to assert that 2FA IS enforced.
 *  admin.json              — session + twofa_verified cookie.
 *                             Used for all admin action tests.
 */
async function setupAdminAuth(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const context = await browser.newContext()

  try {
    const loginRes = await context.request.post(`${BASE_URL}/api/auth/sign-in/email`, {
      data: { email: "admin@test.test", password: "password" },
      headers: { "Content-Type": "application/json" },
    })

    if (!loginRes.ok()) {
      throw new Error(`Admin login failed: ${loginRes.status()} ${await loginRes.text()}`)
    }

    const statusRes = await context.request.get(`${BASE_URL}/api/2fa/status`)
    const statusData = await statusRes.json() as { enabled: boolean, required: boolean }

    let totpSecret: string

    if (statusData.enabled) {
      // 2FA already enabled from a previous run — load the stored secret
      try {
        totpSecret = (await fs.readFile(ADMIN_TOTP_SECRET_FILE, "utf-8")).trim()
      } catch {
        throw new Error(
          "Admin has 2FA enabled but no TOTP secret file found. "
          + "Delete the admin DB user and re-run to start fresh.",
        )
      }

      await context.storageState({ path: path.join(AUTH_DIR, "admin-session-only.json") })
    } else {
      // First run — 2FA not yet enabled. Set it up now
      const setupRes = await context.request.get(`${BASE_URL}/api/2fa/setup`)
      if (!setupRes.ok()) throw new Error(`2FA setup failed: ${await setupRes.text()}`)
      const { secret } = await setupRes.json() as { secret: string }
      totpSecret = secret

      const enableCode = await generateTotpCode(totpSecret)
      const enableRes = await context.request.post(`${BASE_URL}/api/2fa/enable`, {
        data: { code: enableCode },
        headers: { "Content-Type": "application/json" },
      })
      if (!enableRes.ok()) throw new Error(`Failed to enable 2FA: ${await enableRes.text()}`)

      await fs.writeFile(ADMIN_TOTP_SECRET_FILE, totpSecret, "utf-8")

      await context.storageState({ path: path.join(AUTH_DIR, "admin-session-only.json") })
    }

    const challengeCode = await generateTotpCode(totpSecret)
    const challengeRes = await context.request.post(`${BASE_URL}/api/2fa/challenge`, {
      data: { code: challengeCode },
      headers: { "Content-Type": "application/json" },
    })
    if (!challengeRes.ok()) {
      throw new Error(`2FA challenge failed: ${await challengeRes.text()}`)
    }

    await context.storageState({ path: path.join(AUTH_DIR, "admin.json") })
  } finally {
    await context.close()
  }
}

export default globalSetup
