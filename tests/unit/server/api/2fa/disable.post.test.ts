import { describe, vi, beforeEach } from "vitest"
import { disableSuccess, userWith2faEnabled, userWith2faDisabled } from "./data"
import { setupH3Mocks, mockReadBody, setupTwoFaHandlerMocks, testUnauthenticated, testInvalidCode, test2faSuccess } from "./setup"

import endpoint from "~~/server/api/2fa/disable.post"

setupH3Mocks()
setupTwoFaHandlerMocks()

describe("Api Route POST /api/2fa/disable", () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await mockReadBody({ code: "123456" })
    prisma.user.update = vi.fn().mockResolvedValue(userWith2faDisabled)
  })

  describe("when disabling 2FA with valid code", () => {
    test2faSuccess(endpoint, {
      data: userWith2faEnabled,
      expected: disableSuccess,
    })
  })

  describe("when user is not authenticated", () => {
    testUnauthenticated(endpoint, { code: "123456" })
  })

  describe("when code is invalid", () => {
    testInvalidCode(endpoint)
  })
})
