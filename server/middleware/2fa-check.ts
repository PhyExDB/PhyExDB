import prisma from "../lib/prisma"
import { verifyTwofaCookie } from "~~/server/utils/twofa"

export default defineEventHandler(async (event) => {
  const path = event.path || ""

  const EXEMPT_PREFIXES = ["/api/auth", "/api/2fa", "/_nuxt", "/_ipx", "/favicon.ico", "/login", "/register", "/2fa/setup", "/2fa/challenge"]
  if (EXEMPT_PREFIXES.some(prefix => path.startsWith(prefix))) return

  const user = await getUser(event)
  if (!user) return

  const cookies = parseCookies(event)
  const token = cookies["twofa_verified"]
  const isVerifiedByCookie = token ? verifyTwofaCookie(token, user.id) : false

  if (user.twoFactorVerified || isVerifiedByCookie) return

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabled: true },
  })

  if (!record?.twoFactorEnabled) {
    return sendRedirect(event, "/2fa/setup", 302)
  }

  return sendRedirect(event, `/2fa/challenge?redirect=${encodeURIComponent(path)}`, 302)
})
