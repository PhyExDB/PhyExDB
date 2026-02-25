export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)
  const id = getRouterParam(event, "id")

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ReportDialog ID fehlt" })
  }

  const report = await prisma.report.findUnique({
    where: { id },
    include: { experiment: { select: { userId: true } } },
  })

  if (!report) {
    throw createError({ statusCode: 404, statusMessage: "ReportDialog nicht gefunden" })
  }

  if (report.experiment.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: "Nicht erlaubt" })
  }

  await prisma.report.update({
    where: { id },
    data: { seenByOwner: true },
  })

  return { success: true }
})
