export default defineEventHandler(async (event) => {
  const content = await readValidatedBody(event, experimentCommentCreateSchema.parse)
  
  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )
  const user = await authorizeUser(event, experimentCommentAbilities.post, experiment)

  const result = await prisma.comment.create({
    data: {
      experimentId: experiment.id,
      userId: user.id,
      text: content.text,
    },
  })

  return result as ExperimentComment
})

defineRouteMeta({
  openAPI: {
    description: "Crate comment for an experiment",
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
