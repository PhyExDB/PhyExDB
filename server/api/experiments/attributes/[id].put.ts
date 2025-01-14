import { experimentAttributeUpdateSchema } from "~~/shared/types"

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

  const updateName = await readValidatedBody(event, body => experimentAttributeUpdateSchema.parse(body))

  const updatedAttribute = await prisma.experimentAttribute.update({
    where: { id: id },
    data: { name: updateName.name },
    include: { values: true },
  })

  return updatedAttribute.toDetail(attribute.values)
})

defineRouteMeta({
  openAPI: {
    description: "Update an Experiment Attribute",
    tags: ["ExperimentAttribute"],
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
        description: "The updated Attribute",
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
        description: "Invalid body",
      },
      404: {
        description: "Attribute not found",
      },
    },
  },
})
