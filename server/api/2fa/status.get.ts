import { parseCookies } from "h3"
import prisma from "../../lib/prisma"
import { getUser } from "~~/server/utils/auth"
import { verifyTwofaCookie, isTwofaGloballyEnabled } from "~~/server/utils/twofa"

export default defineEventHandler(async (event) => {
  const enabledGlobally = isTwofaGloballyEnabled()
  const user = await getUser(event)

  if (!enabledGlobally || !user) {
    return { authenticated: !!user, enabled: false, required: false, setupRequired: false }
  }
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { twoFactorEnabled: true } })
  const enabled = !!record?.twoFactorEnabled

  if (!enabled) {
    return { authenticated: true, enabled: false, required: false, setupRequired: true }
  }

  const cookies = parseCookies(event)
  const token = cookies["twofa_verified"]
  const verified = token ? verifyTwofaCookie(token, user.id) : false

  return { authenticated: true, enabled: true, required: !verified, setupRequired: false }
})

defineRouteMeta({
  openAPI: {
    tags: ["Two-Factor Authentication"],
    summary: "Get 2FA status",
    description: "Returns whether 2FA is enabled and if verification is required.",
    responses: {
      200: {
        description: "2FA status",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                enabled: { type: "boolean", example: true },
                required: { type: "boolean", example: false },
                setupRequired: { type: "boolean", example: false },
              },
            },
          },
        },
      },
    },
  },
})
