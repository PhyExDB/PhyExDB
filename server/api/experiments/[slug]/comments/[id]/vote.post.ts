export default defineEventHandler(async (event) => {
  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )

  const user = await authorizeUser(event, experimentCommentAbilities.post, {
    commentsEnabled: experiment.commentsEnabled,
  })

  const commentId = getRouterParam(event, "id")
  if (!commentId) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id" })
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  })
  if (!existingComment || existingComment.experimentId !== experiment.id) {
    throw createError({ statusCode: 404, statusMessage: "Comment not found" })
  }

  const existingVote = await prisma.commentVote.findUnique({
    where: {
      userId_commentId: { userId: user.id, commentId },
    },
  })

  if (existingVote) {
    await prisma.commentVote.delete({
      where: { userId_commentId: { userId: user.id, commentId } },
    })
    return { voted: false }
  } else {
    await prisma.commentVote.create({
      data: { userId: user.id, commentId },
    })
    return { voted: true }
  }
})

defineRouteMeta({
  openAPI: {
    summary: "Upvote für einen Kommentar umschalten",
    description:
      "Erstellt einen Upvote für den angegebenen Kommentar oder entfernt ihn, falls der Benutzer bereits abgestimmt hat (Toggle-Logik).",
    tags: ["Experiments", "Comments"],
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "ID oder Slug des Experiments",
      },
      {
        name: "id",
        in: "path",
        required: true,
        description: "ID des Kommentars",
      },
    ],
    responses: {
      200: {
        description: "Vote-Status erfolgreich geändert",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                voted: {
                  type: "boolean",
                  description: "True wenn gevoted wurde, False wenn der Vote entfernt wurde",
                },
              },
              required: ["voted"],
            },
          },
        },
      },
      401: { description: "Nicht authentifiziert" },
      403: { description: "Berechtigung fehlt (z.B. Kommentare deaktiviert)" },
      404: { description: "Experiment oder Kommentar nicht gefunden" },
    },
  },
})
