import prisma from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ status: 400, message: "invalid id" })
  }

  const attribute = await prisma.experimentAttribute.findFirst({
    where: { id: id },
    include: { values: true },
  })

  if (!attribute) {
    throw createError({ status: 404, message: "Attribute not found" })
  }

  return attribute.toDetail(attribute.values.map(value => value.toList()))
})

defineRouteMeta({
  openAPI: {
    description: "Get the values per Attribute",
    tags: ["ExperimentAttribute"],
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
