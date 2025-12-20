import { describe, vi, beforeEach, it, expect } from "vitest"
import { userWith2faDisabled } from "./data"
import { setupH3Mocks, setupAuthMocks, setupTwofaMocks, mockGetUserOrThrowError, testUnauthenticated } from "./setup"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/2fa/setup.get"

setupH3Mocks()
setupAuthMocks()
setupTwofaMocks()

// Mock QRCode
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,mockqrcode"),
  },
}))

// Mock useRuntimeConfig
vi.stubGlobal("useRuntimeConfig", vi.fn().mockReturnValue({
  public: { appName: "ViPDA" },
}))

describe("Api Route GET /api/2fa/setup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv("TWOFA_ENABLED", "true")
    prisma.user.update = vi.fn().mockResolvedValue(userWith2faDisabled)
    mockGetUserOrThrowError.mockResolvedValue(users.user)
  })

  describe("when user is authenticated", () => {
    it("should return setup data", async () => {
      const context = u.getTestContext({
        data: userWith2faDisabled,
        expected: undefined,
        endpoint,
        user: users.user,
      })

      const response = await context.endpoint(u.getEvent(context))

      expect(response).toMatchObject({
        secret: "JBSWY3DPEHPK3PXP",
        issuer: "ViPDA",
        qrDataUrl: "data:image/png;base64,mockqrcode",
      })
      expect(response.otpauthUrl).toContain("otpauth://totp/")
    })
  })

  describe("when user is not authenticated", () => {
    testUnauthenticated(endpoint)
  })
})
