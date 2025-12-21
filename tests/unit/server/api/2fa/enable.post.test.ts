import { describe, vi, beforeEach } from "vitest"
import { enableResponse, userWith2faSetupInProgress } from "./data"
import { setupH3Mocks, mockReadBody, setupTwofaMocks, setupAuthMocks, setupTwoFaHandlerMocks, mockGetUserOrThrowError, testUnauthenticated, testMissingCode, test2faSuccess } from "./setup"
import { users } from "~~/tests/helpers/auth"

import endpoint from "~~/server/api/2fa/enable.post"

setupH3Mocks()
setupTwofaMocks()
setupTwoFaHandlerMocks()
setupAuthMocks()

describe("Api Route POST /api/2fa/enable", () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await mockReadBody({ code: "123456" })
    mockGetUserOrThrowError.mockResolvedValue(users.user)
  })

  describe("when enabling 2FA with valid code", () => {
    test2faSuccess(endpoint, {
      data: userWith2faSetupInProgress,
      expected: enableResponse,
    })
  })

  describe("when code is missing", () => {
    testMissingCode(endpoint)
  })

  describe("when user is not authenticated", () => {
    testUnauthenticated(endpoint, { code: "123456" })
  })
})
