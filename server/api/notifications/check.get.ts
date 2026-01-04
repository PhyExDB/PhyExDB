export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    return {
      userNotifications: 0, publishedCount: 0, needsRevisionCount: 0,
      moderatorNotifications: 0, lastUpdate: null, moderatorLastUpdate: null,
    }
  }

  const [userStats, moderatorData, lastReview] = await Promise.all([
    prisma.experiment.groupBy({
      by: ["status"],
      where: { userId: user.id, status: { in: ["PUBLISHED", "REJECTED"] } },
      _count: true,
    }),

    user.role !== "USER"
      ? prisma.experiment.findMany({
          where: { status: "IN_REVIEW" },
          select: {
            updatedAt: true,
            reviews: {
              where: { reviewerId: user.id, status: "COMPLETED" },
              select: { updatedAt: true },
            },
          },
        })
      : Promise.resolve([]),

    prisma.review.findFirst({
      where: { experiment: { userId: user.id } },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ])

  const publishedCount = userStats.find(s => s.status === "PUBLISHED")?._count ?? 0
  const needsRevisionCount = userStats.find(s => s.status === "REJECTED")?._count ?? 0

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
    userNotifications: publishedCount + needsRevisionCount,
    publishedCount,
    needsRevisionCount,
    moderatorNotifications,
    lastUpdate: lastReview?.updatedAt?.getTime() || null,
    moderatorLastUpdate,
  }
})
