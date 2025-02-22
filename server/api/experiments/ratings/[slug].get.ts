export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.rate)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )

  const rating = await nullTo404(async () =>
    prisma.rating.findUnique({
      where: {
        compoundId: {
          experimentId: experiment.id,
          userId: user.id,
        },
      },
    }),
  )

  return rating as ExperimentRating
})

defineRouteMeta({
  openAPI: {
    description: "Rate an experiment",
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
