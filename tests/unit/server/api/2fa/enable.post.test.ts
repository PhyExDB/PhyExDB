import { describe, expectTypeOf, vi, beforeEach, it, expect } from "vitest"
import { enableResponse, userWith2faSetupInProgress, userWith2faEnabled } from "./data"
import { setupH3Mocks, mockReadBody } from "./setup"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

// Setup H3 mocks before importing endpoint
setupH3Mocks()

// Mock twofa utilities
vi.mock("~~/server/utils/twofa", async (importOriginal) => {
  const actual = await importOriginal() as object
  return {
    ... actual,
    verifyTotp: vi.fn().mockResolvedValue(true),
    generateRecoveryCodes: vi. fn().mockReturnValue(enableResponse.recoveryCodes),
    hashRecoveryCode: vi. fn().mockImplementation((code: string) => `hashed_${code}`),
  }
})

// Mock twoFaHandler
vi.mock("~~/server/utils/twoFaHandler", async (importOriginal) => {
  const actual = await importOriginal() as object
  return {
    ... actual,
    ensure2faEnabledGlobally: vi. fn(),
  }
})

// Mock auth
const { mockGetUserOrThrowError } = vi.hoisted(() => ({
  mockGetUserOrThrowError: vi.fn(),
}))
vi.mock("~~/server/utils/auth", async (importOriginal) => {
  const actual = await importOriginal() as object
  return {
    ...actual,
    getUserOrThrowError: mockGetUserOrThrowError,
  }
})

import endpoint from "~~/server/api/2fa/enable.post"

describe("Api Route POST /api/2fa/enable", () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await mockReadBody({ code: "123456" })
    mockGetUserOrThrowError.mockResolvedValue(users. user)
  })

  describe("when enabling 2FA with valid code", () => {
    const expected = enableResponse

    beforeEach(() => {
      prisma.user.findUnique = vi. fn().mockResolvedValue({
        twoFactorSecret: "JBSWY3DPEHPK3PXP",
        twoFactorEnabled: false,
      })
      prisma.user.update = vi.fn().mockResolvedValue(userWith2faEnabled)
    })

    const context = u.getTestContext({
      data: userWith2faSetupInProgress,
      expected,
      endpoint,
      body: { code: "123456" },
      user: users. user,
    })

    // tests
    {
      expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()
      u.testSuccess(context)
    }
  })

  describe("when code is missing", () => {
    it("should fail with 400", async () => {
      await mockReadBody({})
      prisma.user.findUnique = vi. fn().mockResolvedValue({
        twoFactorSecret: "JBSWY3DPEHPK3PXP",
        twoFactorEnabled: false,
      })

      const context = u.getTestContext({
        data: userWith2faSetupInProgress,
        expected: undefined as any,
        endpoint,
        body: {},
        user: users.user,
      })

      await expect(context.endpoint(u.getEvent(context))).rejects.toMatchObject({
        statusCode:  400,
      })
    })
  })

  describe("when user is not authenticated", () => {
    it("should fail with 401", async () => {
      mockGetUserOrThrowError.mockRejectedValue(
          Object.assign(new Error("Not logged in"), { statusCode: 401 }),
      )

      const context = u.getTestContext({
        data: undefined,
        expected:  undefined as any,
        endpoint,
        body: { code: "123456" },
        user: users.guest,
      })

      await expect(context. endpoint(u.getEvent(context))).rejects.toMatchObject({
        statusCode: 401,
      })
    })
  })
})