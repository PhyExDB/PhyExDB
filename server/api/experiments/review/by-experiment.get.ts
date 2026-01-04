export default defineEventHandler(async (event) => {
  const experimentId = getQuery(event).experimentId as string

  if (!experimentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "experimentId missing",
    })
  }

  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
    select: { id: true },
  })

  if (!experiment) return []

  return prisma.review.findMany({
    where: { experimentId },
    orderBy: { id: "asc" },
    include: {
      reviewer: true,
      sectionsCritiques: {
        orderBy: { createdAt: "asc" },
        include: {
          sectionContent: {
            include: {
              experimentSection: true,
            },
          },
        },
      },
    },
  })
})
