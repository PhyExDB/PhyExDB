import { getUser } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    return {
      userNotifications: 0,
      moderatorNotifications: 0,
    }
  }

  let userNotifications = 0
  let moderatorNotifications = 0

  // 1. Check for user's experiments reviewed at least 2 times
  // We count experiments owned by the user where the number of associated reviews is >= 2.
  const reviewedExperiments = await prisma.experiment.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: { reviews: true },
      },
    },
  })

  userNotifications = reviewedExperiments.filter(exp => exp._count.reviews >= 2).length

  // 2. Check for moderator/admin: count experiments in IN_REVIEW
  if (user.role === "MODERATOR" || user.role === "ADMIN") {
    moderatorNotifications = await prisma.experiment.count({
      where: {
        status: "IN_REVIEW",
      },
    })
  }

  return {
    userNotifications,
    moderatorNotifications,
  }
})
