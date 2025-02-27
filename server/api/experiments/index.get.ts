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
    : []
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

  // Experiment Data
  const result = await prisma.experiment.findMany({
    // ...getPaginationPrismaParam(pageMeta),
    where: {
      status: "PUBLISHED",
      // ...attributeFilter,
      // ...searchCondition,
    },
    include: experimentIncludeForToList,
    orderBy: sortOption,
  })

  const experiments = result.map(experiment => mapExperimentToList(experiment as ExperimentIncorrectList))

  elasticsearch.bulk({
    body: experiments.flatMap(experiment => [
      {
        index: {
          _index: "experiments",
          _id: experiment.id,
        },
      },
      experiment,
    ]),
  })

  elasticsearch.indices.refresh({ index: "experiments" })

  const res = await elasticsearch.search({
    index: "experiments",
    body: {
      query: {
        function_score: {
          query: {
            "bool": {
              "must": [
                { "term": { "status": "PUBLISHED" } },
                ...attributes.map((slug) => ({
                  "nested": {
                    "path": "attributes.values",  // Path to the nested field
                    "query": {
                      "term": { "attributes.values.slug": slug }
                    }
                  }
                })),
              ],
              "should": [
                // only search if there are at least two characters
                ...(querySearchString && /[a-zA-Z].*[a-zA-Z]/.test(querySearchString) ?
                  [
                    ...(
                      querySearchSections.includes("titel") ? 
                        [{ "match": { "name": { query: querySearchString, boost: 2 } } }]
                        : []
                    ),
                    ...(
                      querySearchSections.filter(v => v!=="titel").map((section) => ({
                        "nested": {
                          "path": "sections",
                          "query": {
                            "bool": {
                              "must": [
                                { "term": { "sections.experimentSection.slug": section } },
                                { "match": { "sections.text": querySearchString } }
                              ]
                            }
                          }
                        }
                      }))
                    )
                  ]
                  : []
                ),
              ],
            }
          },
          functions: [
            {
              "script_score": {
                "script": {
                  "source": `
                    if (doc['ratingsCount'].value > 0) {
                      // Use ratingsAvg directly for the average rating
                      double avgRating = doc['ratingsAvg'].value;
                      // Boost by the average rating and apply a logarithmic boost based on the ratingsCount
                      return avgRating * Math.log(1 + doc['ratingsCount'].value);
                    } else {
                      return 2;
                    }
                  `
                }
              }
            }
            // {
            //   "field_value_factor": {
            //     "field": "ratingsAvg",  // Boost based on the average rating
            //     "factor": 0.1,
            //     "modifier": "none",  // No modifier
            //     "missing": 2  // Default value if `ratingsAvg` is missing
            //   }
            // },
            // {
            //   "field_value_factor": {
            //     "field": "ratingsCount",  // Boost based on the number of ratings
            //     "factor": 0.001,  // Apply a smaller scaling factor to the count
            //     "modifier": "log1p",  // Logarithmic scaling to avoid large counts dominating
            //     "missing": 1  // Default value if `ratingsCount` is missing
            //   }
            // }
          ],
          "boost_mode": "sum",  // Multiply the base score by the function score
          // "score_mode": "sum"  // Sum the query score and function scores
        }
      }
      // from: (pageMeta.page - 1) * pageMeta.pageSize,
      // size: pageMeta.pageSize,
    }
  })

  const exps = res.hits.hits.map((hit: any) => hit._source)
  const total = (res.hits.total as unknown as {value: number}).value
  // Pagination
  const pageMeta = getPageMeta(event, total)

  return {
    items:  exps,
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
