import { experimentAttributeValueUpdateSchema } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  const whereClause = getIdPrismaWhereClause(event)

  const attributeValue = await prisma.experimentAttributeValue.findFirst({
    where: whereClause,
  })

  if (!attributeValue) {
    throw createError({ status: 404, message: "Value not found" })
  }

  const updateName = await readValidatedBody(event, body => experimentAttributeValueUpdateSchema.parse(body))

  const updatedValue = await prisma.experimentAttributeValue.update({
    where: whereClause,
    data: { value: updateName.value },
  })

  return updatedValue.toList()
})

defineRouteMeta({
  openAPI: {
    description: "Update an Experiment Value",
    tags: ["ExperimentAttributeValues"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The updated Value",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
              required: ["id", "name"],
            },
          },
        },
      },
      400: {
        description: "Invalid id",
      },
      404: {
        description: "Value not found",
      },
    },
  },
})
