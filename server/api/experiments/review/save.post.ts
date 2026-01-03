import { getUserOrThrowError } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)

  if (user.role === "USER") {
    throw createError({
      statusCode: 403,
      statusMessage: "Nicht berechtigt: Nur Admins oder Moderatoren dürfen Reviews durchführen.",
    })
  }

  const body = await readBody(event)
  const { experimentId, comments } = body as {
    experimentId?: string
    comments?: Record<string, string>
  }

  if (!experimentId) {
    throw createError({ statusCode: 400, statusMessage: "experimentId missing" })
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.upsert({
      where: {
        experimentId_reviewerId: {
          experimentId,
          reviewerId: user.id,
        },
      },
      update: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
      create: {
        experimentId,
        reviewerId: user.id,
        status: "COMPLETED",
      },
    })

    await tx.sectionCritique.deleteMany({
      where: { reviewId: review.id },
    })

    if (comments) {
      const critiquesData = Object.entries(comments)
        .filter(([_, text]) => text?.trim())
        .map(([sectionContentId, text]) => ({
          reviewId: review.id,
          sectionContentId,
          critique: text,
        }))

      if (critiquesData.length > 0) {
        await tx.sectionCritique.createMany({
          data: critiquesData,
        })
      }
    }

    await tx.experiment.update({
      where: { id: experimentId },
      data: { status: "REJECTED" },
    })

    return { success: true }
  })
})
