export default defineEventHandler(async (event) => {
  const where = getIdPrismaWhereClause(event)
  const comment = await nullTo404(async () =>
    await prisma.comment.findFirst({
      where,
      include: {
        experiment: {
          select: {
            userId: true
          }
        }
      }
    }),
  )
  await authorize(event, experimentCommentAbilities.delete, comment)

  await prisma.comment.delete({
    where,
  })
})

defineRouteMeta({
  openAPI: {
    description: "Delete Rating of an experiment",
    tags: ["ExperimentRating"],
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "The ID of the experiment",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    responses: {
      200: {
        description: "Rating deleted successfully",
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
        description: "Experiment not found",
      },
    },
  },
})
