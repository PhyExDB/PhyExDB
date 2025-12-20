import { describe, expectTypeOf, vi, beforeEach, it, expect } from "vitest"
import { userWith2faDisabled } from "./data"
import { setupH3Mocks } from "./setup"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"

// Setup H3 mocks before importing endpoint
setupH3Mocks()

// Mock QRCode
vi.mock("qrcode", () => ({
    default: {
        toDataURL: vi. fn().mockResolvedValue("data:image/png;base64,mockqrcode"),
    },
}))

// Mock twofa utilities
vi.mock("~~/server/utils/twofa", async (importOriginal) => {
    const actual = await importOriginal() as object
    return {
        ...actual,
        generateSecret: vi.fn().mockResolvedValue("JBSWY3DPEHPK3PXP"),
        buildOtpauthUrl: vi. fn().mockReturnValue(
            "otpauth://totp/ViPDA: user@test.test?secret=JBSWY3DPEHPK3PXP&issuer=ViPDA&algorithm=SHA-1&digits=6&period=30",
        ),
    }
})

// Mock auth - starts with authenticated user
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

// Mock useRuntimeConfig
vi.stubGlobal("useRuntimeConfig", vi.fn().mockReturnValue({
    public: { appName: "ViPDA" },
}))

import endpoint from "~~/server/api/2fa/setup.get"

describe("Api Route GET /api/2fa/setup", () => {
    beforeEach(() => {
        vi. clearAllMocks()
        vi.stubEnv("TWOFA_ENABLED", "true")
        prisma.user.update = vi.fn().mockResolvedValue(userWith2faDisabled)
        mockGetUserOrThrowError.mockResolvedValue(users. user)
    })

    describe("when user is authenticated", () => {
        it("should return setup data", async () => {
            const context = u.getTestContext({
                data:  userWith2faDisabled,
                expected: undefined as any,
                endpoint,
                user:  users.user,
            })

            const response = await context.endpoint(u.getEvent(context))

            expect(response).toMatchObject({
                secret: "JBSWY3DPEHPK3PXP",
                issuer: "ViPDA",
                qrDataUrl:  "data:image/png;base64,mockqrcode",
            })
            expect(response.otpauthUrl).toContain("otpauth://totp/")
        })
    })

    describe("when user is not authenticated", () => {
        it("should fail with 401", async () => {
            mockGetUserOrThrowError.mockRejectedValue(
                Object.assign(new Error("Not logged in"), { statusCode: 401 }),
            )

            const context = u. getTestContext({
                data: undefined,
                expected: undefined as any,
                endpoint,
                user: users.guest,
            })

            await expect(context. endpoint(u.getEvent(context))).rejects.toMatchObject({
                statusCode: 401,
            })
        })
    })
})