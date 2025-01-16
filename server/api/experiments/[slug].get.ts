import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/utils"

export default defineEventHandler(async (event) => {
  const experiment = await prisma.experiment.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
    include: experimentIncludeForToList,
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  }

  await authorize(event, canSeeExperiment, experiment)

  return await experiment.toDetail(experiment.attributes)
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
                            fileId: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
                attributes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
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
      401: {
        description: "No user is logged in",
      },
      404: {
        description: "Experiment not found",
      },
    },
  },
})
