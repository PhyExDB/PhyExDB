import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  const experiment = await prisma.experiment.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
    include: {
      ...experimentIncludeForToDetail,
      reviews: {
        where: { status: "COMPLETED" },
        select: { reviewerId: true, updatedAt: true },
      },
    },
  })

  if (!experiment) throw createError({ status: 404 })

  const currentRoundReviews = experiment.reviews.filter(r =>
    new Date(r.updatedAt).getTime() >= new Date(experiment.updatedAt).getTime()
  )

  const mapped = mapExperimentToDetail(experiment as ExperimentIncorrectDetail)

  return {
    ...mapped,
    completedReviewsCount: currentRoundReviews.length,
    alreadyReviewedByMe: user ? currentRoundReviews.some(r => r.reviewerId === user.id) : false,
  }
})

defineRouteMeta({
  openAPI: {
    description: "Fetches an experiment by slug or ID",
    tags: ["Experiment"],
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "The slug or ID of the experiment",
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      200: {
        description: "Experiment fetched successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                slug: { type: "string" },
                userId: { type: "string", format: "uuid" },
                status: {
                  type: "string",
                  enum: ["DRAFT", "IN_REVIEW", "PUBLISHED"],
                },
                duration: { type: "number" },
                previewImageId: { type: "string" },
                revisionOfId: { type: "string", format: "uuid" },
                changeRequest: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                previewImage: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      originalName: { type: "string" },
                      path: { type: "string" },
                      mimeType: { type: "string" },
                      createdById: { type: "string", format: "uuid" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
                attributes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      values: {
                        type: "array",
                        items: { type: "string", format: "uuid" },
                      },
                    },
                  },
                },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      text: { type: "string" },
                      order: { type: "number" },
                      files: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            description: { type: "string" },
                            order: { type: "number" },
                            file: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                mimeType: { type: "string" },
                                path: { type: "string" },
                                originalName: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                      experimentSection: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          slug: { type: "string" },
                          name: { type: "string" },
                          order: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid slug or ID",
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
