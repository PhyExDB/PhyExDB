export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.rate)

  const content = await readValidatedBody(event, experimentRatingSchema.parse)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )

  const where = {
    compoundId: {
      experimentId: experiment.id,
      userId: user.id,
    },
  }

  const { oldRating, rating } = await prisma.$transaction(async (prisma) => {
    const oldRating = await nullTo404(async () =>
      await prisma.rating.findUnique({
        where,
      }),
    )
    const rating = await prisma.rating.update({
      where,
      data: {
        value: content.value,
      },
    })

    return { oldRating, rating }
  })

  prisma.$transaction(async (prisma) => {
    const where = { id: experiment.id }
    const exp = await prisma.experiment.findUniqueOrThrow({ where })
    await prisma.experiment.update({
      where,
      data: {
        ratingsSum: exp.ratingsSum + content.value - oldRating.value,
        ratingsAvg: (exp.ratingsSum + content.value - oldRating.value) / (exp.ratingsCount),
      },
    })
  })

  return rating as ExperimentRating
})

defineRouteMeta({
  openAPI: {
    description: "Update the rating of an experiment",
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
    requestBody: {
      description: "Rated value",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              value: { type: "number" },
            },
            required: ["value"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Rating updated successfully",
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
