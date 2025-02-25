import { Experiment, Prisma, File } from "@prisma/client"
import type { ExperimentIncorrectList, Page } from "~~/shared/types"

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
  const searchString = query.search as string || undefined
  const search = searchString ? { name: { contains: searchString, mode: Prisma.QueryMode.insensitive } } : undefined

  // Total Number of Experiments
  const totalExperiments = await prisma.experiment.count({
    where: {
      status: "PUBLISHED",
      ...attributeFilter,
      ...search,
    },
  })

  // Pagination
  const pageMeta = getPageMeta(event, totalExperiments)

  // const result: (Experiment & File)[] = await prisma.$queryRaw`
  // SELECT *, similarity(name, ${searchString}) FROM "public"."Experiment" as e

  // LEFT JOIN "public"."File" as file ON e."previewImageId" = file."id"
  // LEFT JOIN "public"."_ExperimentToExperimentAttributeValue" as etea ON e."id" = etea."A"
  // LEFT JOIN "public"."ExperimentAttributeValue" as eav ON etea."B" = eav."id"

  // WHERE e.status = 'PUBLISHED' 
  
  // GROUP BY e.id
  
  // ORDER BY similarity(e."name", ${searchString}) DESC

  // LIMIT ${pageMeta.pageSize}
  // OFFSET ${(pageMeta.page - 1 ) * pageMeta.pageSize}`

  const result: (Experiment & File)[] = await prisma.$queryRaw`
    SELECT *, similarity(name, ${searchString}) FROM "public"."Experiment" as e

    WHERE e.status = 'PUBLISHED' and similarity(name, ${searchString}) > 0.001
    
    ORDER BY similarity(e."name", ${searchString}) DESC

    LIMIT ${pageMeta.pageSize}
    OFFSET ${(pageMeta.page - 1 ) * pageMeta.pageSize}`

  return {
    items: result.map(
      experiment => mapExperimentToList(
        { 
          ...experiment, 
          previewImage: undefined,
          attributes: [], 
          revisionOf: undefined,
          revisedBy: undefined,
        } as ExperimentIncorrectList
      )
    ),
    pagination: pageMeta,
  } // as Page<ExperimentList>
  
  //   const experiments = await prisma.experiment.findMany({
  //     ...getPaginationPrismaParam(pageMeta),
  //     where: {
  //       id: {
  //         in: result.map(experiment => experiment.id)
  //       }
  //     },
  //     include: experimentIncludeForToList,
  //   })
  
  // // // Experiment Data
  // // const experiments = await prisma.experiment.findMany({
  // //   ...getPaginationPrismaParam(pageMeta),
  // //   where: {
  // //     status: "PUBLISHED",
  // //     ...attributeFilter,
  // //     ...search,
  // //   },
  // //   include: experimentIncludeForToList,
  // //   orderBy: sortOption,
  // // })

  // return {
  //   items: experiments.map(experiment => mapExperimentToList(experiment as ExperimentIncorrectList)),
  //   pagination: pageMeta,
  // } as Page<ExperimentList>
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
