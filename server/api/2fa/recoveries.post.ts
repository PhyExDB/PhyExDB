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

defineRouteMeta({
  openAPI: {
    tags: ["Two-Factor Authentication"],
    summary: "Regenerate recovery codes",
    description: "Generates a new set of recovery codes after verifying a 2FA code.",
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
                description: "TOTP or recovery code",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "New recovery codes generated",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                recoveryCodes: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
      400: { description: "Invalid code or 2FA not enabled" },
    },
  },
})
