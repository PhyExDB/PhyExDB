import * as v from "valibot"
import prisma from "~~/lib/prisma"

const valueUpdateSchema = v.object({
  name: v.string(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ status: 400, message: "Invalid id" })
  }

  const updateName = await readValidatedBody(event, body => v.parse(valueUpdateSchema, body))

  // TODO: catch error when not found and return 404
  const updatedValue = await prisma.experimentAttributeValue.update({
    where: { id: id },
    data: { name: updateName.name },
  })
  // return (await value.update(updateName)).toAtrributeValueList
  // TODO: to detail
  return updatedValue
})

defineRouteMeta({
  openAPI: {
    description: "Update an Experiment Value",
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
        description: "Invalid body",
      },
      404: {
        description: "Value not found",
      },
    },
  },
})
