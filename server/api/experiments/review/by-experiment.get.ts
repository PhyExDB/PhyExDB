export default defineEventHandler(async (event) => {
  const experimentId = getQuery(event).experimentId as string
  if (!experimentId) throw createError({ statusCode: 400, statusMessage: "experimentId missing" })

  return prisma.review.findMany({
    where: { experimentId },
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: { select: { name: true, image: true } },
      sectionsCritiques: {
        include: { sectionContent: { include: { experimentSection: true } } },
      },
    },
  })
})
