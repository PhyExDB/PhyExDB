import fs from "fs/promises"
import path from "path"
import { test, expect } from "@playwright/test"
import { generateTotpCode } from "~~/tests/helpers/totp"
import { AUTH_DIR, ADMIN_TOTP_SECRET_FILE } from "~~/tests/e2e/global-setup"

test.describe("Admin actions — with valid 2FA session", () => {
  test.use({ storageState: "tests/e2e/.auth/admin.json" })

  test("can access user management page", async ({ page }) => {
    await page.goto("/users")
    await expect(page.getByRole("main")).toBeVisible()
    await expect(page.getByPlaceholder("Filtern nach Name, E-Mail oder Rolle ...")).toBeVisible()
  })

  test("can search for users", async ({ page }) => {
    await page.goto("/users?search=admin")
    await expect(page.getByRole("main")).toBeVisible()
    await expect(page.getByRole("cell", { name: /admin/i }).first()).toBeVisible()
  })

  test("can access category management page", async ({ page }) => {
    await page.goto("/admin/categories")
    await expect(page.getByRole("heading", { name: "Kategorien verwalten" })).toBeVisible()
  })

  test("can add a new experiment attribute category", async ({ page }) => {
    await page.goto("/admin/categories", { waitUntil: "networkidle" })
    await expect(page.getByRole("heading", { name: "Kategorien verwalten" })).toBeVisible()

    await page.getByRole("button", { name: "Kategorie hinzufügen" }).click()

    // Wait for the dialog itself to open via its title
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 10_000 })
    await expect(dialog.getByRole("heading", { name: "Neue Kategorie" })).toBeVisible()

    const categoryName = `Test Kategorie ${Date.now()}`
    await dialog.getByRole("textbox").fill(categoryName)
    await dialog.getByRole("button", { name: "Speichern" }).click()

    await expect(page.getByRole("alert", { name: "Kategorie hinzugefügt" })).toBeVisible({
      timeout: 8_000,
    })

    await expect(page.getByText(categoryName)).toBeVisible()
  })

  test("can ban and unban a user via API", async ({ page }) => {
    const res = await page.request.get("/api/users?search=user@test.test")
    expect(res.ok()).toBeTruthy()
    const { items } = await res.json() as { items: Array<{ id: string, name: string }> }
    const target = items.find(u => u.name === "User")
    expect(target).toBeDefined()

    const banRes = await page.request.post(`/api/users/${target!.id}/ban`)
    expect(banRes.ok()).toBeTruthy()
    expect((await banRes.json()).banned).toBe(true)

    const unbanRes = await page.request.post(`/api/users/${target!.id}/unban`)
    expect(unbanRes.ok()).toBeTruthy()
    expect((await unbanRes.json()).banned).toBe(false)
  })

  test("can change a user role via API", async ({ page }) => {
    const res = await page.request.get("/api/users?search=moderator@test.test")
    const { items } = await res.json() as { items: Array<{ id: string, role: string }> }
    const mod = items[0]!
    expect(mod).toBeDefined()

    const promoteRes = await page.request.put(`/api/users/${mod.id}/role`, {
      data: { role: "ADMIN" },
      headers: { "Content-Type": "application/json" },
    })
    expect(promoteRes.ok()).toBeTruthy()

    const restoreRes = await page.request.put(`/api/users/${mod.id}/role`, {
      data: { role: "MODERATOR" },
      headers: { "Content-Type": "application/json" },
    })
    expect(restoreRes.ok()).toBeTruthy()
  })
})

type StorageState = {
  cookies: {
    name: string
    value: string
    domain: string
    path: string
    expires: number
    httpOnly: boolean
    secure: boolean
    sameSite: "Strict" | "Lax" | "None"
  }[]
  origins: {
    origin: string
    localStorage: { name: string, value: string }[]
  }[]
}

function withoutTwofaCookie(storageState: StorageState): StorageState {
  return {
    ...storageState,
    cookies: storageState.cookies.filter(c => c.name !== "twofa_verified"),
  }
}

test.describe("Admin API — 2FA enforcement", () => {
  test("GET /api/users returns 401 without twofa_verified cookie", async ({ browser }) => {
    const rawState = await fs.readFile(path.join(AUTH_DIR, "admin.json"), "utf-8")
    const storageState = withoutTwofaCookie(JSON.parse(rawState) as StorageState)

    const context = await browser.newContext({ storageState })
    try {
      const res = await context.request.get("/api/users")
      expect(res.status()).toBe(401)
    } finally {
      await context.close()
    }
  })

  test("POST /api/users/:id/ban returns 401 without twofa_verified cookie", async ({ browser }) => {
    const rawState = await fs.readFile(path.join(AUTH_DIR, "admin.json"), "utf-8")
    const storageState = withoutTwofaCookie(JSON.parse(rawState) as StorageState)

    const context = await browser.newContext({ storageState })
    try {
      const res = await context.request.post("/api/users/00000000-0000-0000-0000-000000000000/ban")
      expect(res.status()).toBe(401)
    } finally {
      await context.close()
    }
  })

  test("session-only state (from global-setup) cannot call admin APIs", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, "admin-session-only.json"),
    })
    try {
      const res = await context.request.get("/api/users")
      expect(res.status()).toBe(401)
    } finally {
      await context.close()
    }
  })
})

test.describe("2FA challenge — full UI flow", () => {
  test("admin can complete 2FA challenge via the challenge page", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, "admin-session-only.json"),
    })
    const page = await context.newPage()

    try {
      await page.goto("/2fa/challenge", { waitUntil: "domcontentloaded" })

      await expect(page.getByRole("heading", { name: "2FA erforderlich" })).toBeVisible({
        timeout: 10_000,
      })

      const secret = (await fs.readFile(ADMIN_TOTP_SECRET_FILE, "utf-8")).trim()
      const code = await generateTotpCode(secret)
      await page.getByPlaceholder("123456 oder ABCDE-12345").fill(code)
      await page.getByRole("button", { name: "Bestätigen" }).click()

      await expect(page).not.toHaveURL(/\/2fa\/challenge/, { timeout: 10_000 })
    } finally {
      await context.close()
    }
  })
})
