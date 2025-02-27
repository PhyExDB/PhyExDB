import type { Page } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  // Attribute Filter
  const query = getQuery(event)
  const attributes = (typeof query.attributes === "string" && query.attributes.length > 0)
    ? query.attributes.split(",")
    : []

  // Time Filter
  const minPossibleTime = 5
  const maxPossibleTime = 2 * 60
  const timeFilterTmp = (typeof query.time === "string" && query.time.length > 0)
    ? query.time.split("-")
    : []
  const timeFilter: [number, number] = [parseInt(timeFilterTmp[0]) || minPossibleTime, parseInt(timeFilterTmp[1]) || maxPossibleTime]

  // Searching
  const querySearchString = query.search as string || ""
  const querySearchSections = (typeof query.sections === "string" && query.sections.length > 0)
    ? query.sections.split(",")
    : []

  const pageQuery = getPageQuery(event)

  const res = await elasticsearch.search({
    index: "experiments",
    body: {
      query: {
        function_score: {
          query: {
            bool: {
              must: [
                { term: { status: "PUBLISHED" } },
                { range: { duration: { gte: timeFilter[0], lte: timeFilter[1] } } },
                ...attributes.map(slug => ({
                  nested: {
                    path: "attributes.values", // Path to the nested field
                    query: {
                      term: { "attributes.values.slug": slug },
                    },
                  },
                })),
              ],
              should: [
                // only search if there are at least two characters
                ...(/[a-zA-Z].*[a-zA-Z]/.test(querySearchString)
                  ? [
                      ...(
                        querySearchSections.includes("titel")
                          ? [{ match: { name: { query: querySearchString, boost: 2 } } }]
                          : []
                      ),
                      ...(
                        querySearchSections.filter(v => v !== "titel").map(section => ({
                          nested: {
                            path: "sections",
                            query: {
                              bool: {
                                must: [
                                  { term: { "sections.experimentSection.slug": section } },
                                  { match: { "sections.text": querySearchString } },
                                ],
                              },
                            },
                          },
                        }))
                      ),
                    ]
                  : []
                ),
              ],
            },
          },
          functions: [
            {
              script_score: {
                script: {
                  source: `
                    if (doc['ratingsCount'].value > 0) {
                      // Use ratingsAvg directly for the average rating
                      double avgRating = doc['ratingsAvg'].value;
                      // Boost by the average rating and apply a logarithmic boost based on the ratingsCount
                      return avgRating * Math.log(1 + doc['ratingsCount'].value);
                    } else {
                      return 2;
                    }
                  `,
                },
              },
            },
          ],
          boost_mode: "sum",
        },
      },
      from: (pageQuery.page - 1) * pageQuery.pageSize,
      size: pageQuery.pageSize,
    },
  })

  const exps = res.hits.hits.map(hit => mapExperimentDetailToList(hit._source as ExperimentDetail))

  const total = (res.hits.total as unknown as { value: number }).value
  const pageMeta = getPageMeta(event, total)

  return {
    items: exps,
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
