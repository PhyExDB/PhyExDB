export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 10
  const skip = (page - 1) * pageSize

  const experiments = await prisma.experiment.findMany({
    skip,
    take: pageSize,
    where: {
      status: "PUBLISHED",
    },
    include: {
      attributes: {
        select: {
          name: true,
          id: true,
          attribute: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
  })

  const totalExperiments = await prisma.experiment.count({
    where: {
      status: "PUBLISHED",
    },
  })

  return {
    data: await Promise.all(experiments.map(async experiment => await experiment.toList())),
    pagination: {
      total: totalExperiments,
      page,
      pageSize,
      totalPages: Math.ceil(totalExperiments / pageSize),
    },
  }
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of experiments with their associated attributes.",
    tags: ["Experiment"],
    responses: {
      200: {
        description: "A list of experiments",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
                      slug: { type: "string" },
                      userId: { type: "string" },
                      status: {
                        type: "string",
                        enum: ["DRAFT", "IN_REVIEW", "PUBLISHED"],
                      },
                      duration: { type: "number" },
                      attributes: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            id: { type: "string", format: "uuid" },
                            attributeId: { type: "string", format: "uuid" },
                            createdAt: { type: "string", format: "date-time" },
                            updatedAt: { type: "string", format: "date-time" },
                          },
                        },
                      },
                    },
                  },
                },
                pagination: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
})
