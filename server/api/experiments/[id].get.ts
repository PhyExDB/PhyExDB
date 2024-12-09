import Experiments from "~~/server/database/models/Experiment"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ status: 400, message: "invalid id" })
  }

  const experiment = await Experiments.findOne({
    where: { id: id },
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Attribute not found" })
  }
  return experiment.toExperimentDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Returns details for an experiment",
    tags: ["Experiment"],
    responses: {
      200: {
        description: "Experiment found and details returned",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                createdBy: { type: "string", format: "uuid" },
                title: { type: "string" },
                experimentStatus: { type: "string", enum: ["Draft", "Submitted", "Accepted"] },
                duration: { type: "number" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid experiment id",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusCode: { type: "number" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      404: {
        description: "Experiment not found",
      },
    },
  },
})
