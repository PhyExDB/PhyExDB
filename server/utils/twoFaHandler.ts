import prisma from "../lib/prisma"
import { getUserOrThrowError } from "~~/server/utils/auth"
import { verifyRecoveryCode, verifyTotp } from "~~/server/utils/twofa"

export async function getTwofaUserRecord(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            twoFactorEnabled: true,
            twoFactorSecret: true,
            twoFactorRecoveryCodes: true,
        },
    })
}

export async function verifyTwofaInput(event: any) {
    const body = await readBody<{ code?: string; recovery?: string }>(event)
    if (!body?.code && !body?.recovery) {
        throw createError({ statusCode: 400, statusMessage: "Code or recovery required" })
    }

    const user = await getUserOrThrowError(event)
    const record = await getTwofaUserRecord(user.id)

    let ok = false

    if (body.code && record?.twoFactorSecret) {
        ok = await verifyTotp(body.code, record.twoFactorSecret)
    } else if (body.recovery && record?.twoFactorRecoveryCodes) {
        const idx = record.twoFactorRecoveryCodes.findIndex(stored =>
            verifyRecoveryCode(body.recovery!, stored),
        )
        if (idx !== -1) {
            ok = true
            return { ok, user, record, usedRecoveryIndex: idx }
        }
    }

    return { ok, user, record }
}

export function ensure2faEnabledGlobally() {
    const enabledGlobally = (process.env.TWOFA_ENABLED ?? "true").toLowerCase() !== "false"
    if (!enabledGlobally) {
        throw createError({ statusCode: 404, statusMessage: "Not found" })
    }
}
