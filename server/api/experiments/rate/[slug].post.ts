export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.rate)

  const content = await readValidatedBody(event, experimentRatingSchema.parse)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )

  const rating = await catchPrismaUniqueError(async () =>
    await prisma.rating.create({
      data: {
        experimentId: experiment.id,
        userId: user.id,
        value: content.value,
      },
    }),
  "compoundId",
  )
  if (rating === "NOTUNIQUE") {
    throw createError({ status: 400, message: "Rating already exists" })
  }
  prisma.experiment.update({
    where: { id: experiment.id },
    data: {
      ratingsCount: {
        increment: 1,
      },
      ratingsSum: {
        increment: content.value,
      },
    },
  })

  return rating as ExperimentRating
})

defineRouteMeta({
  openAPI: {
    description: "Rate an experiment",
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
        description: "Rating created successfully",
      },
      400: {
        description: "Invalid slug or ID or allready rated",
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
