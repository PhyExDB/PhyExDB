import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/prisma"

// Define a type for a sign
type SignType = {
  id: string
  name: string
  type: "WARNING" | "SAFETY"
  iconPath: string
}

/**
 * Sort experiment signs:
 * 1. WARNING group: ghs-*, gas-* first, then w*
 * 2. SAFETY group: m*
 * 3. Numeric order inside each group
 */
function sortSigns(signs: SignType[]): SignType[] {
  return [...signs].sort((a, b) => {
    const pathA = a.iconPath ?? ""
    const pathB = b.iconPath ?? ""

    const getGroupPriority = (path: string): number => {
      if (path.startsWith("ghs-") || path.startsWith("gas-")) return 1
      if (path.startsWith("w")) return 2
      if (path.startsWith("m")) return 3
      return 99
    }

    const groupA = getGroupPriority(pathA)
    const groupB = getGroupPriority(pathB)

    if (groupA !== groupB) return groupA - groupB

    return pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: "base" })
  })
}

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

  if (!experiment) throw createError({ status: 404, message: "Experiment not found!" })

  const currentRoundReviews = experiment.reviews.filter(r =>
    new Date(r.updatedAt).getTime() >= new Date(experiment.updatedAt).getTime(),
  )

  const signs: SignType[] = (experiment.signs ?? []) as SignType[]
  const sortedSigns = sortSigns(signs)

  return {
    ...mapExperimentToDetail(experiment as unknown as ExperimentIncorrectDetail),
    signs: sortedSigns,
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
