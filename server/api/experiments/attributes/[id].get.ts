import ExperimentAttribute from "~~/server/database/models/ExperimentAttribute"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ status: 400, message: "invalid id" })
  }

  const attribute = await ExperimentAttribute.findOne({
    where: { id: id },
  })

  if (!attribute) {
    throw createError({ status: 404, message: "Attribute not found" })
  }
  return attribute.toDetailAttributeList()
})

defineRouteMeta({
  openAPI: {
    description: "Get the values per Attribute",
    tags: ["Attribute"],
    responses: {
      200: {
        description: "The values",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                valueList: { type: "array" },
              },
              required: ["id", "name", "valueList"],
            },
          },
        },
      },
      404: {
        description: "Invalid slug",
      },
    },
  },
})
