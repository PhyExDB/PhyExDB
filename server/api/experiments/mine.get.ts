export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.listOwn)

  const totalExperiments = await prisma.experiment.count({
    where: {
      userId: user.id,
    },
  })

  const pageMeta = getPageMeta(event, totalExperiments)

  const experiments = await prisma.experiment.findMany({
    ...getPaginationPrismaParam(pageMeta),
    where: {
      userId: user.id,
    },
    orderBy: [
      {
        status: "desc",
      }, {
        createdAt: "asc",
      },
    ],
    include: experimentIncludeForToList,
  })

  return {
    items: experiments.map(experiment => mapExperimentToList(experiment as ExperimentIncorrectList)),
    pagination: pageMeta,
  } as Page<ExperimentList>
})

defineRouteMeta({
  openAPI: {
    description: "Lists all experiments of the current user.",
    tags: ["Experiment"],
    responses: {
      200: {
        description: "A list of experiments",
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
      },
      401: {
        description: "Unauthorized",
      },
    },
  },
})
