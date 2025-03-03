export default defineEventHandler(async (event) => {
  await authorizeUser(event, experimentAbilities.review)

  const totalExperiments = await prisma.experiment.count({
    where: {
      status: "IN_REVIEW",
    },
  })

  const pageMeta = getPageMeta(event, totalExperiments)

  const experiments = await prisma.experiment.findMany({
    ...getPaginationPrismaParam(pageMeta),
    where: {
      status: "IN_REVIEW",
    },
    orderBy: {
      createdAt: "asc",
    },
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
                      previewImageId: { type: "string" },
                      revisionOfId: { type: "string" },
                      changeRequests: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                      previewImage: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          originalName: { type: "string" },
                          path: { type: "string" },
                          mimeType: { type: "string" },
                          createdById: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" },
                        },
                      },
                      attributes: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            slug: { type: "string" },
                            name: { type: "string" },
                            order: { type: "number" },
                            multipleSelection: { type: "boolean" },
                            values: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "string", format: "uuid" },
                                  slug: { type: "string" },
                                  value: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                      revisionOf: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
                          slug: { type: "string" },
                          userId: { type: "string", format: "uuid" },
                          status: { type: "string", enum: ["DRAFT", "IN_REVIEW", "PUBLISHED"] },
                          duration: { type: "number" },
                          previewImageId: { type: "string", format: "uuid" },
                          revisionOfId: { type: "string", format: "uuid" },
                          changeRequest: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" },
                        },
                      },
                      revisedBy: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
                          slug: { type: "string" },
                          userId: { type: "string", format: "uuid" },
                          status: { type: "string", enum: ["DRAFT", "IN_REVIEW", "PUBLISHED"] },
                          duration: { type: "number" },
                          previewImageId: { type: "string", format: "uuid" },
                          revisionOfId: { type: "string", format: "uuid" },
                          changeRequest: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          updatedAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
                pagination: {
                  type: "object",
                  properties: {
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    totalPages: { type: "integer" },
                    total: { type: "integer" },
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
        description: "No user logged in",
      },
      403: {
        description: "Forbidden",
      },
    },
  },
})
