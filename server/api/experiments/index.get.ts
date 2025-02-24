import { Prisma } from "@prisma/client"
import type { Page } from "~~/shared/types"

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
  let shouldSearchSections = false
  if (querySearchSections?.includes("titel")) {
    shouldSearchTitle = true
    shouldSearchSections = querySearchSections.length > 1 ? true : false
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

  return {
    items: experiments.map(experiment => mapExperimentToList(experiment as ExperimentIncorrectList)),
    pagination: pageMeta,
  } as Page<ExperimentList>
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
