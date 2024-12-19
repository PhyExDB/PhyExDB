import { validate as uuidValidate } from "uuid"

export default defineEventHandler(async (event) => {
  const slugOrId = getRouterParam(event, "slug")
  if (!slugOrId) {
    throw createError({ status: 400, message: "Invalid slug" })
  }

  const isId = uuidValidate(slugOrId)
  const whereClause = isId ? { id: slugOrId } : { slug: slugOrId }

  const experiment = await prisma.experiment.findFirst({
    where: whereClause,
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found" })
  }
  return experiment.toDetail()
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
