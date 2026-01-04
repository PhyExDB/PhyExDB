import { getUser } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) return { userNotifications: 0, moderatorNotifications: 0, lastUpdate: null }

  const userNotifications = await prisma.experiment.count({
    where: {
      userId: user.id,
      status: { in: ["REJECTED", "PUBLISHED"] },
    },
  })

  let moderatorNotifications = 0
  if (user.role !== "USER") {
    const experimentsInReview = await prisma.experiment.findMany({
      where: { status: "IN_REVIEW" },
      select: {
        id: true,
        updatedAt: true,
        reviews: {
          where: {
            reviewerId: user.id,
            status: "COMPLETED",
          },
          select: { updatedAt: true },
        },
      },
    })

    // Wir filtern manuell: Ein Experiment zählt nur als "Notification",
    // wenn der Admin noch gar kein Review hat ODER das Review älter ist als das Experiment-Update
    moderatorNotifications = experimentsInReview.filter((exp) => {
      const myReview = exp.reviews[0]
      if (!myReview) return true // Noch nie reviewt -> Anzeigen

      // Wenn das Experiment neuer ist als mein letztes Review -> Wieder anzeigen!
      return exp.updatedAt > myReview.updatedAt
    }).length
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
  }
})
