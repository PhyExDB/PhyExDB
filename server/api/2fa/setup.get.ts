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
