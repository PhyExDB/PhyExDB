import { Prisma } from "@prisma/client"

export default defineEventHandler(async (event) => {
  // Attribute Filter
  const query = getQuery(event)
  const attributes = (typeof query.attributes === "string" && query.attributes.length > 0)
    ? query.attributes.split(",")
    : []
  const attributeFilters = attributes.map(slug => ({
    attributes: {
      some: {
        slug: slug,
      },
    },
  }))
  const attributeFilter = attributeFilters.length > 0 ? { AND: attributeFilters } : {}

  // Sorting
  const sort = query.sort as string || undefined
  let sortOption
  if (sort === "alphabetical") {
    sortOption = { name: "asc" as const }
  } else if (sort === "duration") {
    sortOption = { duration: "asc" as const }
  } else if (sort === "ratingsAvg") {
    sortOption = { ratingsAvg: "desc" as const }
  } else {
    sortOption = undefined
  }

  // Searching
  const querySearchString = query.search as string || undefined
  const querySearchSections = (typeof query.sections === "string" && query.sections.length > 0)
    ? query.sections.split(",")
    : undefined
  let shouldSearchTitle = false
  let shouldSearchSections: boolean
  if (querySearchSections?.includes("titel")) {
    shouldSearchTitle = true
    shouldSearchSections = querySearchSections.length > 1
  } else {
    shouldSearchSections = true
  }

  const searchTitle = shouldSearchTitle
    ? {
        name: {
          contains: querySearchString,
          mode: Prisma.QueryMode.insensitive,
        },
      }
    : undefined

  const searchSections = shouldSearchSections
    ? {
        sections: {
          some: {
            experimentSection: {
              slug: {
                in: shouldSearchSections ? querySearchSections : undefined,
              },
            },
            text: {
              contains: querySearchString,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      }
    : undefined

  let searchCondition
  if ((shouldSearchTitle && shouldSearchSections) || (!shouldSearchTitle && shouldSearchSections)) {
    searchCondition = {
      OR: [
        { ...searchTitle },
        { ...searchSections },
      ],
    }
  } else if (shouldSearchTitle) {
    searchCondition = { ...searchTitle }
  } else {
    searchCondition = undefined
  }

  // Total Number of Experiments
  const totalExperiments = await prisma.experiment.count({
    where: {
      status: "PUBLISHED",
      ...attributeFilter,
      ...searchCondition,
    },
  })

  // Pagination
  const pageMeta = getPageMeta(event, totalExperiments)

  // Experiment Data
  const experiments = await prisma.experiment.findMany({
    ...getPaginationPrismaParam(pageMeta),
    where: {
      status: "PUBLISHED",
      ...attributeFilter,
      ...searchCondition,
    },
    include: experimentIncludeForToList,
    orderBy: sortOption,
  })

  // Favorite Experiments
  const user = await getUser(event)
  let favoriteIds: string[] = []
  let userFavorites: { experimentId: string, numberForSequence: number }[] = []
  if (user) {
    userFavorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { experimentId: true, numberForSequence: true },
    })
    favoriteIds = userFavorites.map(f => f.experimentId)
  }

  return {
    items: experiments.map((experiment) => {
      const mapped = mapExperimentToList(experiment as ExperimentIncorrectList)
      return {
        ...mapped,
        isFavorited: favoriteIds.includes(mapped.id), // Hier wird die Info gebündelt hinzugefügt
        favoriteNumberForSequence: userFavorites.find(f => f.experimentId === mapped.id)?.numberForSequence,
      }
    }),
    pagination: pageMeta,
  }
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of all experiments with their associated attributes.",
    tags: ["Experiment"],
    responses: {
      200: {
        description: "A list of all experiments",
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
