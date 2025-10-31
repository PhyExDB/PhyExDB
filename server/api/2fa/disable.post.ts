import prisma from "../../lib/prisma"
import { deleteCookie } from "h3"
import { ensure2faEnabledGlobally, verifyTwofaInput } from "~~/server/utils/twoFaHandler"

export default defineEventHandler(async (event) => {
    ensure2faEnabledGlobally()

    const { ok, user, record } = await verifyTwofaInput(event)
    if (!record?.twoFactorEnabled) return { disabled: true }
    if (!ok) throw createError({ statusCode: 400, statusMessage: "Invalid code" })

    await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorRecoveryCodes: [] },
    })
    deleteCookie(event, "twofa_verified")

    return { disabled: true }
})
