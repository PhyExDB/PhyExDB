export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.rate)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )

  const rating = await prismaRecordNotFoundTo404(async () =>
    await prisma.rating.delete({
      where: {
        compoundId: {
          experimentId: experiment.id,
          userId: user.id,
        },
      },
    }),
  )

  prisma.$transaction(async (prisma) => {
    const where = { id: experiment.id }
    const exp = await prisma.experiment.findUniqueOrThrow({ where })
    await prisma.experiment.update({
      where,
      data: {
        ratingsCount: exp.ratingsCount - 1,
        ratingsSum: exp.ratingsSum - rating.value,
        ratingsAvg: (exp.ratingsSum - rating.value) / (exp.ratingsCount - 1),
      },
    })
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
