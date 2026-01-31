export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    return {
      publishedCount: 0,
      userNotifications: 0,
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
      select: { updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),

    // Versuche die beanstandet wurden
    prisma.experiment.findMany({
      where: {
        userId: user.id,
        status: "REJECTED",
      },
      select: { updatedAt: true },
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
              where: { reviewerId: user.id },
              orderBy: { updatedAt: "desc" },
              take: 1,
              select: { updatedAt: true, status: true },
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
    const myLatestReview = exp.reviews[0]

    if (!myLatestReview) return true

    const isUpToDate = myLatestReview.status === "COMPLETED"
      && myLatestReview.updatedAt.getTime() >= exp.updatedAt.getTime()

    return !isUpToDate
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
