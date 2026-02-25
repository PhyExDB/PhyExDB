import { auth } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: new Headers(event.node.req.headers as HeadersInit),
  })

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Nicht authentifiziert" })
  }

  const id = getRouterParam(event, "id")

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Report ID fehlt" })
  }

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      experiment: true,
    },
  })

  if (!report) {
    throw createError({ statusCode: 404, statusMessage: "Report nicht gefunden" })
  }

  if (report.experiment.userId !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: "Nicht erlaubt" })
  }

  await prisma.report.update({
    where: { id },
    data: { seenByOwner: true },
  })

  return { success: true }
})
