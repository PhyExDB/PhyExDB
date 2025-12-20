import { describe, vi, beforeEach } from "vitest"
import { challengeSuccess, userWith2faEnabled } from "./data"
import { setupH3Mocks, mockReadBody, setupTwofaMocks, setupTwoFaHandlerMocks, mockVerifyTwofaInput, testUnauthenticated, testInvalidCode, test2faSuccess } from "./setup"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/2fa/challenge.post"

// Setup common mocks before importing endpoint
setupH3Mocks()
setupTwofaMocks()
setupTwoFaHandlerMocks()

describe("Api Route POST /api/2fa/challenge", () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await mockReadBody({ code: "123456" })
    prisma.user.update = vi.fn().mockResolvedValue(userWith2faEnabled)
  })

  describe("when verifying with valid TOTP code", () => {
    test2faSuccess(endpoint, {
      data: userWith2faEnabled,
      expected: challengeSuccess,
    })
  })

  describe("when verifying with valid recovery code", () => {
    const expected = challengeSuccess

    beforeEach(async () => {
      await mockReadBody({ code: "ABCDE-12345" })
      mockVerifyTwofaInput.mockResolvedValue({
        ok: true,
        user: users.user,
        record: {
          twoFactorEnabled: true,
          twoFactorSecret: "JBSWY3DPEHPK3PXP",
          twoFactorRecoveryCodes: ["hashed1", "hashed2"],
        },
        usedRecoveryIndex: 0,
      })
    })

    const context = u.getTestContext({
      data: userWith2faEnabled,
      expected,
      endpoint,
      body: { code: "ABCDE-12345" },
      user: users.user,
    })

    // tests
    {
      u.testSuccess(context)
    }
  })

  describe("when user is not authenticated", () => {
    testUnauthenticated(endpoint, { code: "123456" })
  })

  describe("when code is invalid", () => {
    testInvalidCode(endpoint)
  })
})
