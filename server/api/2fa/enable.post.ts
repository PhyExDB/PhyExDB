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

    if (!verifyTotp(body.code, record.twoFactorSecret)) {
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
