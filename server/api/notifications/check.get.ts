import { ModeratorTask } from "#shared/types/Review.type";

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) return { needsRevisionCount: 0, moderatorNotifications: 0, lastRejectedAt: 0, moderatorLastUpdate: 0 }

  const [rejected, moderatorData] = await Promise.all([
    // REJECTED Versuche des Users
    prisma.experiment.aggregate({
      where: { userId: user.id, status: "REJECTED" },
      _count: true,
      _max: { updatedAt: true },
    }),

    // Offene Reviews für Moderatoren
    user.role !== "USER"
      ? prisma.experiment.findMany({
          where: { status: "IN_REVIEW", userId: { not: user.id } },
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
      : [],
  ])

  const relevantModTasks = (moderatorData as ModeratorTask[]).filter((exp) => {
    const myReview = exp.reviews[0]
    return !myReview || (myReview.status !== "COMPLETED" || myReview.updatedAt < exp.updatedAt)
  })

  return {
    needsRevisionCount: rejected._count,
    lastRejectedAt: rejected._max.updatedAt?.getTime() || null,
    moderatorNotifications: relevantModTasks.length,
    moderatorLastUpdate: relevantModTasks.length > 0
      ? Math.max(...relevantModTasks.map(e => e.updatedAt.getTime()))
      : null,
  }
})
