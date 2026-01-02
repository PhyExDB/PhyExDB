import { auth } from "~~/server/utils/auth"

export default defineEventHandler(async (event) => {
  // Session holen
  const session = await auth.api.getSession({
    headers: event.node.req.headers,
  })

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
  }
  const user = session.user

  if (user.role === "USER") {
    throw createError({ statusCode: 403, statusMessage: "Not allowed" })
  }

  // Body lesen
  const body = await readBody(event)

  const { experimentId, comments } = body as {
    experimentId?: string
    comments?: Record<string, string>
  }

  console.log("BODY:", body) // Test
  console.log("COMMENTS:", comments) // Test

  if (!experimentId) {
    throw createError({ statusCode: 400, statusMessage: "experimentId missing" })
  }

  // Review anlegen mit temporärem Platzhalter für sectionCritiqueId
  const review = await prisma.review.create({
    data: {
      experimentId,
      reviewerId: user.id,
      alreadyReviewed: true,
      sectionCritiqueId: "__TEMP__", // temporär
    },
  })

  // Alle Section IDs des Experiments holen
  const sectionIds = (
    await prisma.experimentSectionContent.findMany({
      where: { experimentId },
      select: { id: true },
    })
  ).map(s => s.id)

  // SectionCritiques speichern
  let firstCritiqueId: string | null = null
  for (const [sectionContentId, critique] of Object.entries(comments ?? {})) {
    if (!critique?.trim()) continue

    // prüfen, ob die SectionContentId zum Experiment gehört
    if (!sectionIds.includes(sectionContentId)) continue

    const sc = await prisma.sectionCritique.create({
      data: {
        reviewId: review.id,
        sectionContentId,
        critique,
      },
    })

    if (!firstCritiqueId) firstCritiqueId = sc.id
  }

  // Review updaten, damit sectionCritiqueId auf echte Kritik zeigt
  if (firstCritiqueId) {
    await prisma.review.update({
      where: { id: review.id },
      data: { sectionCritiqueId: firstCritiqueId },
    })
  }

  // Experiment ablehnen
  await prisma.experiment.update({
    where: { id: experimentId },
    data: { status: "REJECTED" },
  })

  return { success: true }
})
