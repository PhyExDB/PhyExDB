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

  const oldValue = await prisma.$transaction(async (prisma) => {
    const rating = await nullTo404(async () =>
      await prisma.rating.findUnique({
        where,
      }),
    )
    prisma.rating.update({
      where,
      data: {
        value: content.value,
      },
    })

    return rating.value
  })

  prisma.experiment.update({
    where: { id: experiment.id },
    data: {
      ratingsSum: {
        increment: content.value - oldValue,
      },
    },
  })
})

defineRouteMeta({
  openAPI: {
    description: "Update the rating of an experiment",
    tags: ["Experiment"],
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
