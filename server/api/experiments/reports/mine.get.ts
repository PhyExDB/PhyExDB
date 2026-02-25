import { auth } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: new Headers(event.node.req.headers as HeadersInit),
  })

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Nicht authentifiziert" })
  }

  const reports = await prisma.report.findMany({
    where: {
      experiment: {
        userId: session.user.id,
      },
      seenByOwner: false,
    },
    include: {
      experiment: true,
    },
  })

  return reports
})
