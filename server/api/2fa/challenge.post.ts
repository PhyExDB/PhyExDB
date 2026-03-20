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

  setTwofaCookie(event, user.id)

  return { verified: true }
})

defineRouteMeta({
  openAPI: {
    tags: ["Two-Factor Authentication"],
    summary: "Verify 2FA code",
    description: "Verifies a TOTP or recovery code and sets the 2FA verification cookie.",
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
                description: "6-digit TOTP code or recovery code",
                example: "123456",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "2FA successfully verified",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                verified: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      400: { description: "Invalid code" },
    },
  },
})
