export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) return { userNotifications: 0, moderatorNotifications: 0, lastUpdate: null, moderatorLastUpdate: null }

  const userNotifications = await prisma.experiment.count({
    where: { userId: user.id, status: { in: ["REJECTED", "PUBLISHED"] } },
  })

  let moderatorNotifications = 0
  let moderatorLastUpdate: Date | null = null

  if (user.role !== "USER") {
    const experimentsInReview = await prisma.experiment.findMany({
      where: { status: "IN_REVIEW" },
      select: {
        updatedAt: true,
        reviews: {
          where: { reviewerId: user.id, status: "COMPLETED" },
          select: { updatedAt: true },
        },
      },
    })

    const relevantExps = experimentsInReview.filter((exp) => {
      const myReview = exp.reviews[0]
      if (!myReview) return true
      return exp.updatedAt > myReview.updatedAt
    })

    moderatorNotifications = relevantExps.length

    if (relevantExps.length > 0) {
      moderatorLastUpdate = new Date(Math.max(...relevantExps.map(e => e.updatedAt.getTime())))
    }
  }

  const lastReview = await prisma.review.findFirst({
    where: { experiment: { userId: user.id } },
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  })

  return {
    userNotifications,
    moderatorNotifications,
    lastUpdate: lastReview?.updatedAt?.getTime() || null,
    moderatorLastUpdate: moderatorLastUpdate?.getTime() || null,
  }
})