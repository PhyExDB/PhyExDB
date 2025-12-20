/**
 * Shared test setup for 2FA tests
 * This file contains common mocks and utilities used across all 2FA tests
 */
import { vi, it, expect } from "vitest"
import type { Endpoint } from "better-auth"
import { enableResponse } from "./data"
import { users } from "~~/tests/helpers/auth"

/**
 * Shared test cases
 */
import * as u from "~~/tests/helpers/utils"

/**
 * Common mock functions - initialized as empty vi.fn()
 * Their behavior can be customized in beforeEach of individual tests
 */
export const mockGetUser = vi.fn().mockResolvedValue(users.user)
export const mockGetUserOrThrowError = vi.fn().mockResolvedValue(users.user)
export const mockVerifyTwofaInput = vi.fn()

/**
 * Setup all H3 mocks - call this at module level before tests run
 */
export function setupH3Mocks() {
  vi.mock("h3", async (importOriginal) => {
    const actual = await importOriginal() as object
    return {
      ...actual,
      parseCookies: vi.fn().mockReturnValue({}),
      setCookie: vi.fn(),
      deleteCookie: vi.fn(),
      readBody: vi.fn().mockResolvedValue({ code: "123456" }),
      createError: vi.fn().mockImplementation((opts) => {
        const error = new Error(opts.statusMessage || opts.message) as Error & { statusCode: number }
        error.statusCode = opts.statusCode
        return error
      }),
      defineEventHandler: vi.fn().mockImplementation(handler => handler),
      getRouterParams: vi.fn().mockReturnValue({}),
      getQuery: vi.fn().mockReturnValue({}),
      setResponseStatus: vi.fn(),
    }
  })
}

/**
 * Common mock for auth utilities
 */
export function setupAuthMocks() {
  vi.mock("~~/server/utils/auth", async (importOriginal) => {
    const actual = await importOriginal() as object
    return {
      ...actual,
      getUser: mockGetUser,
      getUserOrThrowError: mockGetUserOrThrowError,
    }
  })
}

/**
 * Common mock for twofa utilities
 */
export function setupTwofaMocks() {
  vi.mock("~~/server/utils/twofa", async (importOriginal) => {
    const actual = await importOriginal() as object
    return {
      ...actual,
      verifyTwofaCookie: vi.fn().mockReturnValue(false),
      isTwofaGloballyEnabled: vi.fn().mockReturnValue(true),
      signTwofaCookie: vi.fn().mockReturnValue("mock-jwt-token"),
      generateSecret: vi.fn().mockResolvedValue("JBSWY3DPEHPK3PXP"),
      buildOtpauthUrl: vi.fn().mockReturnValue(
        "otpauth://totp/ViPDA:user@test.test?secret=JBSWY3DPEHPK3PXP&issuer=ViPDA",
      ),
      verifyTotp: vi.fn().mockResolvedValue(true),
      generateRecoveryCodes: vi.fn().mockReturnValue(enableResponse.recoveryCodes),
      hashRecoveryCode: vi.fn().mockImplementation((code: string) => `hashed_${code}`),
    }
  })
}

/**
 * Common mock for twoFaHandler
 */
export function setupTwoFaHandlerMocks() {
  vi.mock("~~/server/utils/twoFaHandler", async (importOriginal) => {
    const actual = await importOriginal() as object
    return {
      ...actual,
      ensure2faEnabledGlobally: vi.fn(),
      verifyTwofaInput: mockVerifyTwofaInput,
    }
  })
}

/**
 * Update readBody mock for specific body content
 */
export async function mockReadBody(body: object) {
  const h3 = await import("h3")
  vi.mocked(h3.readBody).mockResolvedValue(body)
}

/**
 * Update parseCookies mock with specific cookies
 */
export async function mockParseCookies(cookies: Record<string, string>) {
  const h3 = await import("h3")
  vi.mocked(h3.parseCookies).mockReturnValue(cookies)
}

export function testUnauthenticated(endpoint: Endpoint, body: unknown = {}) {
  it("should fail with 401 when user is not authenticated", async () => {
    mockGetUserOrThrowError.mockRejectedValue(
      Object.assign(new Error("Not logged in"), { statusCode: 401 }),
    )
    mockVerifyTwofaInput.mockRejectedValue(
      Object.assign(new Error("Not logged in"), { statusCode: 401 }),
    )

    const context = u.getTestContext({
      data: undefined,
      expected: undefined,
      endpoint,
      body,
      user: users.guest,
    })

    await expect(context.endpoint(u.getEvent(context))).rejects.toMatchObject({
      statusCode: 401,
    })
  })
}

export function testInvalidCode(endpoint: Endpoint, body: unknown = { code: "000000" }) {
  it("should fail with 400 when code is invalid", async () => {
    mockVerifyTwofaInput.mockResolvedValue({
      ok: false,
      user: users.user,
      record: {
        twoFactorEnabled: true,
        twoFactorSecret: "JBSWY3DPEHPK3PXP",
        twoFactorRecoveryCodes: [],
      },
      usedRecoveryIndex: undefined,
    })

    const context = u.getTestContext({
      data: {},
      expected: undefined,
      endpoint,
      body,
      user: users.user,
    })

    await expect(context.endpoint(u.getEvent(context))).rejects.toMatchObject({
      statusCode: 400,
    })
  })
}

export function testMissingCode(endpoint: Endpoint) {
  it("should fail with 400 when code is missing", async () => {
    await mockReadBody({})

    const context = u.getTestContext({
      data: {},
      expected: undefined,
      endpoint,
      body: {},
      user: users.user,
    })

    await expect(context.endpoint(u.getEvent(context))).rejects.toMatchObject({
      statusCode: 400,
    })
  })
}

export function test2faSuccess(endpoint: Endpoint, { body = { code: "123456" }, expected, data }: { body?: unknown, expected: unknown, data: unknown }) {
  it("should succeed with valid code", async () => {
    mockVerifyTwofaInput.mockResolvedValue({
      ok: true,
      user: users.user,
      record: {
        twoFactorEnabled: true,
        twoFactorSecret: "JBSWY3DPEHPK3PXP",
        twoFactorRecoveryCodes: [],
      },
      usedRecoveryIndex: undefined,
    })

    const context = u.getTestContext({
      data,
      expected,
      endpoint,
      body,
      user: users.user,
    })

    u.testSuccess(context)
  })
}
