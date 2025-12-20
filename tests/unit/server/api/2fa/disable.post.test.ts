import { describe, expectTypeOf, vi, beforeEach, it, expect } from "vitest"
import { disableSuccess, userWith2faEnabled, userWith2faDisabled } from "./data"
import { setupH3Mocks, mockReadBody } from "./setup"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

// Setup H3 mocks before importing endpoint
setupH3Mocks()

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

import endpoint from "~~/server/api/2fa/disable.post"

describe("Api Route POST /api/2fa/disable", () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        await mockReadBody({ code: "123456" })
        prisma.user.update = vi.fn().mockResolvedValue(userWith2faDisabled)
    })

    describe("when disabling 2FA with valid code", () => {
        const expected = disableSuccess

        beforeEach(() => {
            mockVerifyTwofaInput. mockResolvedValue({
                ok: true,
                user: users.user,
                record: {
                    twoFactorEnabled: true,
                    twoFactorSecret: "JBSWY3DPEHPK3PXP",
                    twoFactorRecoveryCodes: [],
                },
                usedRecoveryIndex: undefined,
            })
        })

        const context = u.getTestContext({
            data: userWith2faEnabled,
            expected,
            endpoint,
            body: { code: "123456" },
            user:  users.user,
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

    describe("when code is invalid", () => {
        it("should fail with 400", async () => {
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
                data: userWith2faEnabled,
                expected: undefined as any,
                endpoint,
                body: { code: "000000" },
                user: users.user,
            })

            await expect(context.endpoint(u. getEvent(context))).rejects.toMatchObject({
                statusCode: 400,
            })
        })
    })
})