export default defineEventHandler(async (event) => {
  const experimentId = getQuery(event).experimentId as string

  if (!experimentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "experimentId missing",
    })
  }

  // Prüfen, ob Experiment existiert
  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
    select: { id: true },
  })

  if (!experiment) return []

  return prisma.review.findMany({
    where: { experimentId },
    orderBy: { createdAt: "asc" },
    include: {
      reviewer: {
        select: { name: true, image: true },
      },
      sectionsCritiques: true,
    },
  })
})
