import prisma from "../../lib/prisma"
import { getUserOrThrowError } from "~~/server/utils/auth"
import { generateRecoveryCodes, hashRecoveryCode, verifyTotp } from "~~/server/utils/twofa"
import { ensure2faEnabledGlobally } from "~~/server/utils/twoFaHandler"

export default defineEventHandler(async (event) => {
    ensure2faEnabledGlobally()

    const user = await getUserOrThrowError(event)
    const body = await readBody<{ code: string }>(event)
    if (!body?.code) throw createError({ statusCode: 400, statusMessage: "Code required" })

    const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { twoFactorSecret: true, twoFactorEnabled: true },
    })

    if (!record?.twoFactorSecret) throw createError({ statusCode: 400, statusMessage: "2FA not initialized" })
    if (record.twoFactorEnabled) throw createError({ statusCode: 400, statusMessage: "2FA already enabled" })

    if (!(await verifyTotp(body.code, record.twoFactorSecret))) {
        throw createError({ statusCode: 400, statusMessage: "Invalid code" })
    }

    const recovery = generateRecoveryCodes(10)
    const hashed = recovery.map(hashRecoveryCode)

    await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true, twoFactorRecoveryCodes: hashed },
    })

    return { recoveryCodes: recovery }
})

defineRouteMeta({
    openAPI: {
        tags: ["Two-Factor Authentication"],
        summary: "Enable 2FA",
        description: "Confirms 2FA setup by validating a TOTP code and generating recovery codes.",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["code"],
                        properties: {
                            code: {
                                type: "string",
                                description: "6-digit TOTP code",
                            },
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "2FA enabled",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                recoveryCodes: {
                                    type: "array",
                                    items: { type: "string" },
                                    example: ["abcd-efgh", "ijkl-mnop"],
                                },
                            },
                        },
                    },
                },
            },
            400: { description: "Invalid code or already enabled" },
        },
    },
})
