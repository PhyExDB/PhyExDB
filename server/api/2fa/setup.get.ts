import prisma from "../../lib/prisma"
import { getUserOrThrowError } from "~~/server/utils/auth"
import { buildOtpauthUrl, generateSecret } from "~~/server/utils/twofa"

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig()
  const enabledGlobally = (process.env.TWOFA_ENABLED ?? "true").toLowerCase() !== "false"
  if (!enabledGlobally) {
    throw createError({ statusCode: 404, statusMessage: "Not found" })
  }
  const user = await getUserOrThrowError(event)
  const secret = await generateSecret()
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret } })

  const otpauthUrl = buildOtpauthUrl({ secret, accountName: user.email, issuer: runtime.public.appName })

  return {
    secret,
    otpauthUrl,
    issuer: runtime.public.appName,
  }
})

defineRouteMeta({
  openAPI: {
    tags: ["Two-Factor Authentication"],
    summary: "Initialize 2FA",
    description: "Generates a TOTP secret and otpauth URL for authenticator apps.",
    responses: {
      200: {
        description: "2FA setup initialized",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                secret: { type: "string", example: "JBSWY3DPEHPK3PXP" },
                otpauthUrl: { type: "string" },
                issuer: { type: "string", example: "MyApp" },
              },
            },
          },
        },
      },
      404: { description: "2FA globally disabled" },
    },
  },
})
