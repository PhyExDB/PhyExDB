import * as v from "valibot"
import prisma from "~~/lib/prisma"

const attributeUpdateSchema = v.object({
  name: v.string(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ status: 400, message: "invalid id" })
  }

  const updateName = await readValidatedBody(event, body => v.parse(attributeUpdateSchema, body))

  // TODO catch error when not found and return 404
  const updatedAttribute = await prisma.experimentAttribute.update({
    where: { id: id },
    data: { name: updateName.name },
  })

  // TODO: detail
  return updatedAttribute
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
