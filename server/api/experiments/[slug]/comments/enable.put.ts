export default defineEventHandler(async (event) => {
  const content = await readValidatedBody(event, experimentCommentEnabledSchema.parse)

  const where = getSlugOrIdPrismaWhereClause(event)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where,
    }),
  )
  await authorize(event, experimentCommentAbilities.enable, experiment)

  await prisma.experiment.update({
    where,
    data: {
      commentsEnabled: content.enable,
    },
  })

  return content as ExperimentCommentEnabled
})

defineRouteMeta({
  openAPI: {
    description: "Enable or disable comments for an experiment",
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
    ],
    requestBody: {
      description: "Enable or disable comments",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              enable: { type: "boolean" },
            },
            required: ["enable"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Comments disabled or enabled successfully",
      },
      400: {
        description: "Invalid slug or body",
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
