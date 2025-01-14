import type { Page } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  const totalExperiments = await prisma.experiment.count({
    where: {
      status: "PUBLISHED",
    },
  })

  const pageMeta = getPageMeta(event, totalExperiments)

  const experiments = await prisma.experiment.findMany({
    ...getPaginationPrismaParam(pageMeta),
    where: {
      status: "PUBLISHED",
    },
    include: {
      attributes: {
        select: {
          value: true,
          id: true,
          attribute: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
  })

  const result: Page<ExperimentList> = {
    items: experiments.map(experiment => experiment.toList(experiment.attributes)),
    pagination: pageMeta,
  }

  return result
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
