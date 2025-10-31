import { signTwofaCookie } from "~~/server/utils/twofa"
import prisma from "../../lib/prisma"
import { ensure2faEnabledGlobally, verifyTwofaInput } from "~~/server/utils/twoFaHandler"

export default defineEventHandler(async (event) => {
    ensure2faEnabledGlobally()

    const { ok, user, record, usedRecoveryIndex } = await verifyTwofaInput(event)

    if (!record?.twoFactorEnabled) return { verified: true }
    if (!ok) throw createError({ statusCode: 400, statusMessage: "Invalid code" })
    if (usedRecoveryIndex !== undefined) {
        const updated = [...record.twoFactorRecoveryCodes]
        updated.splice(usedRecoveryIndex, 1)
        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorRecoveryCodes: updated },
        })
    }

    const token = signTwofaCookie(user.id)
    setCookie(event, "twofa_verified", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 12,
    })

    return { verified: true }
})