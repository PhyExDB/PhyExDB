import * as v from "valibot"
import ExperimentAttribute from "~~/server/database/models/ExperimentAttribute"
import ExperimentAttributeValue from "~~/server/database/models/ExperimentAttributeValue"

const valueSchema = v.object({
  id: v.string(),
  name: v.string(),
})
export default defineEventHandler(async (event) => {
  const attributeId = getRouterParam(event, "id")
  if (!attributeId) {
    throw createError({ status: 400, message: "Invalid attribute id" })
  }
  const attribute = await ExperimentAttribute.findOne({
    where: { id: attributeId },
  })
  if (!attribute) {
    throw createError({ status: 404, message: "Attribute not found" })
  }
  const newValue = await readValidatedBody(event, body => v.parse(valueSchema, body))
  const createValue = await ExperimentAttributeValue.create({ id: newValue.id, name: newValue.name })
  return attribute.toAttributeDetailWithAdditionalValue(createValue)
})

defineRouteMeta({
  openAPI: {
    description: "Create new Value to an existing attribute",
    tags: ["ExperimentAttribute"],
    responses: {
      200: {
        description: "A list of the attribute with the addition of the created value",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  valueList: { type: "array" },
                },
              },
            },
          },
        },
      },
    },
  },
})
