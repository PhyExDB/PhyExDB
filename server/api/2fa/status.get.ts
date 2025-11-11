import prisma from "../../lib/prisma"
import { getUser } from "~~/server/utils/auth"
import { verifyTwofaCookie, isTwofaGloballyEnabled } from "~~/server/utils/twofa"

export default defineEventHandler(async (event) => {
  const enabledGlobally = isTwofaGloballyEnabled()
  if (!enabledGlobally) {
    return { enabled: false, required: false }
  }
  const user = await getUser(event)
  if (!user) {
    return { enabled: false, required: false }
  }
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { twoFactorEnabled: true } })
  const enabled = !!record?.twoFactorEnabled
  if (!enabled) return { enabled: false, required: false }

  const cookies = parseCookies(event)
  const token = cookies["twofa_verified"]
  const verified = token ? verifyTwofaCookie(token, user.id) : false

  return { enabled: true, required: !verified }
})
