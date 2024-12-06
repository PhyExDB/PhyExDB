import * as v from "valibot"
import ExperimentAttributeValue from "~~/server/database/models/ExperimentAttributeValue"

const valueUpdateSchema = v.object({
  name: v.string(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ status: 400, message: "Invalid id" })
  }

  const value = await ExperimentAttributeValue.findOne({
    where: { id: id },
  })
  if (!value) {
    throw createError({ status: 404, message: "Value not found" })
  }
  const updateName = await readValidatedBody(event, body => v.parse(valueUpdateSchema, body))
  return (await value.update(updateName)).toAtrributeValueList
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
