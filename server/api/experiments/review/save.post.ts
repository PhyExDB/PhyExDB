import { getUserOrThrowError } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)
  if (user.role === "USER") {
    throw createError({ statusCode: 403, statusMessage: "Nicht berechtigt." })
  }

  const body = await readBody(event)
  const { experimentId, comments, approve } = body as {
    experimentId: string
    comments?: Record<string, string>
    approve: boolean
  }

  if (!experimentId) {
    throw createError({ statusCode: 400, statusMessage: "ID fehlt" })
  }

  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
    select: { updatedAt: true, userId: true },
  })

  if (!experiment) throw createError({ statusCode: 404, statusMessage: "Experiment nicht gefunden" })

  if (experiment.userId === user.id) {
    throw createError({ statusCode: 403, statusMessage: "Du kannst deinen eigenen Versuch nicht überprüfen." })
  }

  const now = new Date()

  return prisma.$transaction(async (tx) => {
    // Hat dieser Admin bereits für die AKTUELLE Version gestimmt?
    const existingReview = await tx.review.findFirst({
      where: {
        experimentId,
        reviewerId: user.id,
        status: "COMPLETED",
        // Wenn das Review neuer ist als das letzte Experiment-Update, hat er schon gestimmt
        updatedAt: { gte: experiment.updatedAt },
      },
    })

    if (existingReview && approve) {
      throw createError({
        statusCode: 400,
        statusMessage: "Du hast bereits für diese Version gestimmt. Ein anderes Teammitglied muss die Zweitprüfung übernehmen.",
      })
    }

    const review = await tx.review.upsert({
      where: {
        experimentId_reviewerId: { experimentId, reviewerId: user.id },
      },
      update: { status: "COMPLETED", updatedAt: now },
      create: { experimentId, reviewerId: user.id, status: "COMPLETED", updatedAt: now },
    })

    await tx.sectionCritique.deleteMany({ where: { reviewId: review.id } })

    if (!approve) {
      // FALL: BEANSTANDUNG
      if (comments) {
        const critiquesData = Object.entries(comments)
          .filter(([_, text]) => text?.trim() && text !== "<p></p>")
          .map(([sectionContentId, text]) => ({
            reviewId: review.id,
            sectionContentId,
            critique: text,
          }))

        if (critiquesData.length > 0) {
          await tx.sectionCritique.createMany({ data: critiquesData })
        }
      }

      await tx.experiment.update({
        where: { id: experimentId },
        data: {
          status: "REJECTED",
          updatedAt: now,
        },
      })

      return { success: true, message: "Beanstandet." }
    } else {
      // FALL: AKZEPTIEREN
      // Zähle andere gültige Reviews (die NACH dem letzten Experiment-Update erstellt wurden)
      const otherApprovals = await tx.review.count({
        where: {
          experimentId,
          status: "COMPLETED",
          reviewerId: { not: user.id },
          updatedAt: { gte: experiment.updatedAt },
        },
      })

      const newStatus = otherApprovals >= 1 ? "PUBLISHED" : "IN_REVIEW"

      await tx.experiment.update({
        where: { id: experimentId },
        data: {
          status: newStatus,
          updatedAt: now,
        },
      })

      return {
        success: true,
        status: newStatus,
        message: newStatus === "PUBLISHED" ? "Veröffentlicht." : "Erste Bestätigung erhalten.",
      }
    }
  })
})
