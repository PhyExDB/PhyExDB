import { parseCookies } from "h3"
import prisma from "../../lib/prisma"
import { getUser } from "~~/server/utils/auth"
import { verifyTwofaCookie, isTwofaGloballyEnabled } from "~~/server/utils/twofa"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    return { authenticated: false, enabled: false, verified: false }
  }

  if (!isTwofaGloballyEnabled()) {
    return { authenticated: true, enabled: true, verified: true }
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabled: true },
  })

  const enabled = !!record?.twoFactorEnabled
  const cookies = parseCookies(event)
  const token = cookies["twofa_verified"]
  const verified = token ? verifyTwofaCookie(token, user.id) : false

  return {
    authenticated: true,
    enabled,
    verified,
  }
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
                authenticated: { type: "boolean", example: true },
                enabled: { type: "boolean", example: true },
                setupRequired: { type: "boolean", example: false },
              },
            },
          },
        },
      },
    },
  },
})
