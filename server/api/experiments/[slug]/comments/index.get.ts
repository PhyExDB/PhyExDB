export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  await authorize(event, experimentCommentAbilities.getAll)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )
  if (!experiment.commentsEnabled) {
    return false
  }

  const where = { experimentId: experiment.id, parentId: null }

  const total = await prisma.comment.count({ where })
  const pageMeta = getPageMeta(event, total)

  const result = await prisma.comment.findMany({
    ...getPaginationPrismaParam(pageMeta),
    where,
    include: {
      user: { select: { id: true, name: true } },
      votes: user
        ? {
            where: { userId: user.id },
            select: { userId: true },
          }
        : false,
      children: {
        include: {
          user: { select: { id: true, name: true } },
          votes: user
            ? {
                where: { userId: user.id },
                select: { userId: true },
              }
            : false,
        },
      },
    },
    orderBy: [
      { upvotesCount: "desc" },
      { createdAt: "desc" },
    ],
  })

  const items = result.map(comment => ({
    ...comment,
    userHasVoted: !!comment.votes?.length,
    children: comment.children.map(child => ({
      ...child,
      userHasVoted: !!child.votes?.length,
    })),
  }))

  return {
    items: items as ExperimentComment[],
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
                      upvotesCount: { type: "integer" },
                      userHasVoted: { type: "boolean" },
                      children: { type: "array", items: { $ref: "#/components/schemas/ExperimentComment" } },
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
        },
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
