import { describe, vi, beforeEach } from "vitest"
import { recoveriesResponse, userWith2faEnabled } from "./data"
import { setupH3Mocks, mockReadBody, setupTwofaMocks, setupTwoFaHandlerMocks, testUnauthenticated, testInvalidCode, test2faSuccess } from "./setup"

import endpoint from "~~/server/api/2fa/recoveries.post"

setupH3Mocks()
setupTwofaMocks()
setupTwoFaHandlerMocks()

describe("Api Route POST /api/2fa/recoveries", () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await mockReadBody({ code: "123456" })
    prisma.user.update = vi.fn().mockResolvedValue(userWith2faEnabled)
    // Set recovery codes specifically for this test
    const twofa = await import("~~/server/utils/twofa")
    vi.mocked(twofa.generateRecoveryCodes).mockReturnValue(recoveriesResponse.recoveryCodes)
  })

  describe("when regenerating recovery codes with valid 2FA code", () => {
    test2faSuccess(endpoint, {
      data: userWith2faEnabled,
      expected: recoveriesResponse,
    })
  })

  describe("when user is not authenticated", () => {
    testUnauthenticated(endpoint, { code: "123456" })
  })

  describe("when code is invalid or 2FA not enabled", () => {
    testInvalidCode(endpoint)
  })
})
