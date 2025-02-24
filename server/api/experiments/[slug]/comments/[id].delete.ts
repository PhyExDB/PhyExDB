export default defineEventHandler(async (event) => {
  const where = getIdPrismaWhereClause(event)
  const comment = await nullTo404(async () =>
    await prisma.comment.findFirst({
      where,
      include: {
        experiment: {
          select: {
            userId: true,
          },
        },
      },
    }),
  )
  await authorize(event, experimentCommentAbilities.delete, comment)

  await prisma.comment.delete({
    where,
  })
})

defineRouteMeta({
  openAPI: {
    description: "Delete comments of an experiment",
    tags: ["ExperimentComment"],
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "The slug of the experiment",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
      {
        name: "id",
        in: "path",
        required: true,
        description: "The id of the comment",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    responses: {
      200: {
        description: "Comment deleted successfully",
      },
      400: {
        description: "Invalid slug or ID",
      },
      401: {
        description: "No user is logged in",
      },
      403: {
        description: "Unauthorized",
      },
      404: {
        description: "Experiment or Comment not found",
      },
    },
  },
})
