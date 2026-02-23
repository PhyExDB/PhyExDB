export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.rate)

  const content = await readValidatedBody(event, experimentRatingSchema.parse)

  const slug = getRouterParam(event, "slug")!

  const experiment = await nullTo404(async () =>
    prisma.experiment.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug },
        ],
      },
    }),
  )

  const ratingWhere = {
    compoundId: {
      experimentId: experiment.id,
      userId: user.id,
    },
  }

  const { oldRating, rating } = await prisma.$transaction(async (tx) => {
    const oldRating = await nullTo404(async () =>
      tx.rating.findUnique({
        where: ratingWhere,
      }),
    )

    const rating = await tx.rating.update({
      where: ratingWhere,
      data: {
        value: content.value,
      },
    })

    return { oldRating, rating }
  })

  await prisma.$transaction(async (tx) => {
    const experimentWhere = { id: experiment.id }

    const exp = await tx.experiment.findUnique({
      where: experimentWhere,
    })

    if (!exp) {
      throw createError({ statusCode: 404, statusMessage: "Not found" })
    }

    const newSum = exp.ratingsSum + content.value - oldRating.value

    await tx.experiment.update({
      where: experimentWhere,
      data: {
        ratingsSum: newSum,
        ratingsAvg: newSum / exp.ratingsCount,
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
