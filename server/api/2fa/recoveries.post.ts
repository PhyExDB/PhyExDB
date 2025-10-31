import prisma from "../../lib/prisma"
import { generateRecoveryCodes, hashRecoveryCode } from "~~/server/utils/twofa"
import { ensure2faEnabledGlobally, verifyTwofaInput } from "~~/server/utils/twoFaHandler"

export default defineEventHandler(async (event) => {
    ensure2faEnabledGlobally()

    const { ok, user, record, usedRecoveryIndex } = await verifyTwofaInput(event)

    if (!ok || !record?.twoFactorEnabled) {
        throw createError({ statusCode: 400, statusMessage: "Invalid code or 2FA not enabled" })
    }

    if (typeof usedRecoveryIndex === "number") {
        const updated = [...record.twoFactorRecoveryCodes]
        updated.splice(usedRecoveryIndex, 1)
        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorRecoveryCodes: updated },
        })
    }

    const newCodes = generateRecoveryCodes(10)
    const hashed = newCodes.map(hashRecoveryCode)
    await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorRecoveryCodes: hashed },
    })

    return { recoveryCodes: newCodes }
})
