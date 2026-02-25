import { deleteCookie } from "h3"
import prisma from "../../lib/prisma"
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

defineRouteMeta({
  openAPI: {
    tags: ["Two-Factor Authentication"],
    summary: "Disable 2FA",
    description: "Disables two-factor authentication after verifying a valid 2FA code.",
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
                description: "Current TOTP or recovery code",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "2FA disabled",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                disabled: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      400: { description: "Invalid code" },
    },
  },
})
