export default defineEventHandler(async (event) => {
  await authorize(event, experimentCommentAbilities.getAll)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )
  if (!experiment.commentsEnabled) {
    return null
  }

  const where = { experimentId: experiment.id }

  const total = await prisma.comment.count({ where })
  const pageMeta = getPageMeta(event, total)

  const result = await prisma.comment.findMany({
    ...getPaginationPrismaParam(pageMeta),
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return {
    items: result as ExperimentComment[],
    pagination: pageMeta,
  } as Page<ExperimentComment>
})

defineRouteMeta({
  openAPI: {
    description: "Get comments of an experiment",
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
    responses: {
      200: {
        description: "Comments returned successfully or null if comments are disabled",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      text: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
                        },
                        required: ["id", "name"],
                      },
                    },
                    required: ["id", "text", "createdAt", "user"],
                  },
                },
                pagination: {
                  type: "object",
                  properties: {
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                  required: ["page", "pageSize", "total"],
                },
              },
              required: ["items", "pagination"],
            },
          },
        }
      },
      400: {
        description: "Invalid slug",
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
