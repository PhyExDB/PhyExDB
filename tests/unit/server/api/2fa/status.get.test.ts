import { describe, expectTypeOf, vi, beforeEach } from "vitest"
import { statusDisabled, statusEnabled, userWith2faEnabled, userWith2faDisabled } from "./data"
import { setupH3Mocks, mockParseCookies } from "./setup"
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
        verifyTwofaCookie: vi.fn().mockReturnValue(false),
        isTwofaGloballyEnabled: vi.fn().mockReturnValue(true),
    }
})

// Mock auth
vi.mock("~~/server/utils/auth", async (importOriginal) => {
    const actual = await importOriginal() as object
    return {
        ... actual,
        getUser: vi.fn().mockResolvedValue(users.user),
    }
})

import endpoint from "~~/server/api/2fa/status.get"

describe("Api Route GET /api/2fa/status", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("when 2FA is disabled for user", () => {
        const expected = statusDisabled

        const context = u.getTestContext({
            data: userWith2faDisabled,
            expected,
            endpoint,
            user: users.user,
        })

        beforeEach(() => {
            prisma.user.findUnique = vi.fn().mockResolvedValue({ twoFactorEnabled: false })
        })

        // tests
        {
            expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()
            u.testSuccess(context)
        }
    })

    describe("when 2FA is enabled for user and not verified", () => {
        const expected = statusEnabled

        const context = u.getTestContext({
            data: userWith2faEnabled,
            expected,
            endpoint,
            user: users.user,
        })

        beforeEach(async () => {
            await mockParseCookies({})
            prisma.user. findUnique = vi.fn().mockResolvedValue({ twoFactorEnabled:  true })
        })

        // tests
        {
            u.testSuccess(context)
        }
    })

    describe("when user is not logged in", () => {
        const expected = statusDisabled

        const context = u.getTestContext({
            data: undefined,
            expected,
            endpoint,
            user: users.guest,
        })

        beforeEach(async () => {
            const authModule = await import("~~/server/utils/auth")
            vi.mocked(authModule.getUser).mockResolvedValue(null)
        })

        // tests
        {
            u.testSuccess(context)
        }
    })
})