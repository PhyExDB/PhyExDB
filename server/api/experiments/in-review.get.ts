export default defineEventHandler(async (event) => {
  await authorizeUser(event, experimentAbilities.review)
  const user = await getUserOrThrowError(event)

  const allExperiments = await prisma.experiment.findMany({
    where: {
      status: "IN_REVIEW",
      userId: { not: user.id },
    },
    include: {
      ...experimentIncludeForToList,
      reviews: {
        orderBy: { updatedAt: "desc" },
        select: { reviewerId: true, updatedAt: true, status: true },
      },
    },
  })

  const filteredAndMapped = allExperiments.reduce<(ExperimentList & { completedReviewsCount: number })[]>((acc, exp) => {
    const expTime = new Date(exp.updatedAt).getTime()

    const currentRoundReviews = (exp.reviews || []).filter(r =>
      r.status === "COMPLETED"
      && new Date(r.updatedAt).getTime() >= expTime,
    )

    const alreadyParticipatedInThisRound = currentRoundReviews.some(r => r.reviewerId === user.id)

    if (!alreadyParticipatedInThisRound) {
      const mapped = mapExperimentToList(exp as ExperimentIncorrectList) as ExperimentList
      acc.push({
        ...mapped,
        completedReviewsCount: currentRoundReviews.length,
      })
    }
    return acc
  }, [])

  const total = filteredAndMapped.length
  const pageMeta = getPageMeta(event, total)
  const start = (pageMeta.page - 1) * pageMeta.pageSize
  const paginatedItems = filteredAndMapped.slice(start, start + pageMeta.pageSize)

  return {
    items: paginatedItems,
    pagination: pageMeta,
  }
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
                          completedReviewsCount: { type: "integer" },
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
