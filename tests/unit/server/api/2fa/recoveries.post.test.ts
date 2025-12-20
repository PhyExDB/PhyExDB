import { describe, expectTypeOf, vi, beforeEach, it, expect } from "vitest"
import { recoveriesResponse, userWith2faEnabled } from "./data"
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
        ...actual,
        generateRecoveryCodes: vi. fn().mockReturnValue(recoveriesResponse.recoveryCodes),
        hashRecoveryCode:  vi.fn().mockImplementation((code:  string) => `hashed_${code}`),
    }
})

// Mock twofa handler - create a controllable mock
const { mockVerifyTwofaInput } = vi.hoisted(() => ({
    mockVerifyTwofaInput: vi.fn(),
}))
vi.mock("~~/server/utils/twoFaHandler", async (importOriginal) => {
    const actual = await importOriginal() as object
    return {
        ...actual,
        ensure2faEnabledGlobally: vi.fn(),
        verifyTwofaInput: mockVerifyTwofaInput,
    }
})

import endpoint from "~~/server/api/2fa/recoveries.post"

describe("Api Route POST /api/2fa/recoveries", () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        await mockReadBody({ code:  "123456" })
        prisma. user.update = vi.fn().mockResolvedValue(userWith2faEnabled)
    })

    describe("when regenerating recovery codes with valid 2FA code", () => {
        const expected = recoveriesResponse

        beforeEach(() => {
            mockVerifyTwofaInput. mockResolvedValue({
                ok:  true,
                user: users.user,
                record: {
                    twoFactorEnabled: true,
                    twoFactorSecret: "JBSWY3DPEHPK3PXP",
                    twoFactorRecoveryCodes: ["existing-code"],
                },
                usedRecoveryIndex: undefined,
            })
        })

        const context = u.getTestContext({
            data: userWith2faEnabled,
            expected,
            endpoint,
            body:  { code: "123456" },
            user: users.user,
        })

        // tests
        {
            expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()
            u.testSuccess(context)
        }
    })

    describe("when user is not authenticated", () => {
        it("should fail with 401", async () => {
            mockVerifyTwofaInput.mockRejectedValue(
                Object.assign(new Error("Not logged in"), { statusCode: 401 }),
            )

            const context = u.getTestContext({
                data: undefined,
                expected: undefined as any,
                endpoint,
                body:  { code: "123456" },
                user: users.guest,
            })

            await expect(context.endpoint(u. getEvent(context))).rejects.toMatchObject({
                statusCode: 401,
            })
        })
    })

    describe("when code is invalid or 2FA not enabled", () => {
        it("should fail with 400", async () => {
            mockVerifyTwofaInput. mockResolvedValue({
                ok:  false,
                user: users.user,
                record: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    twoFactorRecoveryCodes: [],
                },
                usedRecoveryIndex:  undefined,
            })

            const context = u.getTestContext({
                data:  userWith2faEnabled,
                expected:  undefined as any,
                endpoint,
                body: { code:  "000000" },
                user: users.user,
            })

            await expect(context.endpoint(u.getEvent(context))).rejects.toMatchObject({
                statusCode:  400,
            })
        })
    })
})