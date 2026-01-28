export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    return {
      publishedCount: 0,
      userNotifications: 0,
      newlyPublishedCount: 0,
      needsRevisionCount: 0,
      moderatorNotifications: 0,
      lastPublishedAt: null,
      lastRejectedAt: null,
      moderatorLastUpdate: null,
    }
  }

  const [
    publishedExperiments,
    rejectedExperiments,
    moderatorData,
  ] = await Promise.all([
    // Alle veröffentlichten Versuche
    prisma.experiment.findMany({
      where: { userId: user.id, status: "PUBLISHED" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),

    // Versuche die beanstandet wurden
    prisma.experiment.findMany({
      where: {
        userId: user.id,
        status: "DRAFT",
        reviews: {
          some: {
            sectionsCritiques: {
              some: {},
            },
          },
        },
      },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),

    // Moderator: Offene Reviews
    user.role !== "USER"
      ? prisma.experiment.findMany({
          where: {
            status: "IN_REVIEW",
            userId: { not: user.id },
          },
          select: {
            updatedAt: true,
            reviews: {
              where: { reviewerId: user.id, status: "COMPLETED" },
              select: { updatedAt: true },
            },
          },
        })
      : Promise.resolve([]),
  ])

  const publishedCount = publishedExperiments.length
  const needsRevisionCount = rejectedExperiments.length
  const lastPublishedAt = publishedExperiments[0]?.updatedAt?.getTime() || null
  const lastRejectedAt = rejectedExperiments[0]?.updatedAt?.getTime() || null

  const relevantModExps = moderatorData.filter((exp) => {
    const myReview = exp.reviews[0]
    if (!myReview) return true
    return exp.updatedAt.getTime() > myReview.updatedAt.getTime()
  })

  const moderatorNotifications = relevantModExps.length
  const moderatorLastUpdate = moderatorNotifications > 0
    ? Math.max(...relevantModExps.map(e => e.updatedAt.getTime()))
    : null

  return {
    publishedCount,
    needsRevisionCount,
    moderatorNotifications,
    lastPublishedAt,
    lastRejectedAt,
    moderatorLastUpdate,
    userNotifications: (lastPublishedAt ? 1 : 0) + (lastRejectedAt ? 1 : 0),
  }
})
