export default defineEventHandler(async (event) => {
  const attribute = await prisma.experimentAttribute.findFirst({
    where: getIdPrismaWhereClause(event),
    include: { values: true },
  })

  if (!attribute) {
    throw createError({ status: 404, message: "Attribute not found" })
  }

  return attribute.toDetail(attribute.values)
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
