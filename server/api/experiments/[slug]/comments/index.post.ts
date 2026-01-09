export default defineEventHandler(async (event) => {
  const content = await readValidatedBody(event, experimentCommentCreateSchema.parse)
  content.text = sanitizeHTML(content.text)

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
      parentId: content.parentId ?? null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return result as ExperimentComment
})

defineRouteMeta({
  openAPI: {
    description: "Create comment for an experiment",
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
      description: "Comment to create",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              text: { type: "string" },
            },
            required: ["text"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Comment created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                text: { type: "string" },
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                  },
                  required: ["id", "name"],
                },
              },
              required: ["id", "text", "user"],
            },
          },
        },
      },
      400: {
        description: "Invalid slug or comment data",
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
