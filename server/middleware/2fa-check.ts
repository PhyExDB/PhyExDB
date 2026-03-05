import prisma from "../lib/prisma"

export default defineEventHandler(async (event) => {
  const path = event.path || ""
  const EXEMPT_PREFIXES = ["/api/auth", "/api/2fa", "/_nuxt", "/favicon.ico", "/login", "/register", "/2fa/setup", "/2fa/challenge"]
  const isExempt = EXEMPT_PREFIXES.some(prefix => path.startsWith(prefix))
  if (isExempt) return

  const user = await getUser(event)
  if (!user) return

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabled: true },
  })

  if (!record?.twoFactorEnabled) {
    return sendRedirect(event, "/2fa/setup", 302)
  }
})
