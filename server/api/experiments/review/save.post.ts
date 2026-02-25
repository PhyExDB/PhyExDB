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
    select: {
      id: true,
      name: true,
      slug: true,
      updatedAt: true,
      userId: true,
    },
  })

  if (!experiment) throw createError({ statusCode: 404, statusMessage: "Experiment nicht gefunden" })

  if (experiment.userId === user.id) {
    throw createError({ statusCode: 403, statusMessage: "Du kannst deinen eigenen Versuch nicht überprüfen." })
  }

  const now = new Date()

  return prisma.$transaction(async (tx) => {
    // Hat dieser Admin bereits für die AKTUELLE Version gestimmt?
    const alreadyApprovedThisVersion = await tx.review.findFirst({
      where: {
        experimentId,
        reviewerId: user.id,
        status: "COMPLETED",
        // Wenn das Review neuer ist als das letzte Experiment-Update, hat er schon gestimmt
        updatedAt: { gte: experiment.updatedAt },
        sectionsCritiques: { none: {} },
      },
    })

    if (approve && alreadyApprovedThisVersion) {
      throw createError({
        statusCode: 400,
        statusMessage: "Du hast dieser Version bereits zugestimmt. Warte auf ein zweites Teammitglied.",
      })
    }

    const review = await tx.review.create({
      data: {
        experimentId,
        reviewerId: user.id,
        status: "COMPLETED",
        updatedAt: now,
      },
    })

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
        },
      })

      if (experiment.userId) {
        await tx.notification.create({
          data: {
            userId: experiment.userId,
            type: "EXPERIMENT_REJECTED",
            title: "Versuch beanstandet",
            message: `Dein Versuch "${experiment.name}" wurde beanstandet.`,
            link: `/experiments/edit/${experiment.id}`,
          },
        })
      }

      return { success: true, message: "Beanstandet. Status auf REJECTED gesetzt." }
    } else {
      // FALL: AKZEPTIEREN
      const otherApprovals = await tx.review.count({
        where: {
          experimentId,
          status: "COMPLETED",
          reviewerId: { not: user.id },
          updatedAt: { gte: experiment.updatedAt },
          sectionsCritiques: { none: {} },
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

      if (newStatus === "PUBLISHED" && experiment.userId) {
        await tx.notification.create({
          data: {
            userId: experiment.userId,
            type: "EXPERIMENT_PUBLISHED",
            title: "Versuch veröffentlicht!",
            message: `Dein Versuch "${experiment.name}" wurde veröffentlicht!`,
            link: `/experiments/${experiment.slug}`,
          },
        })
      }

      return {
        success: true,
        status: newStatus,
        message: newStatus === "PUBLISHED" ? "Veröffentlicht." : "Erste Bestätigung erhalten.",
      }
    }
  })
})
