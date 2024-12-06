import * as v from "valibot"
import ExperimentAttribute from "~~/server/database/models/ExperimentAttribute"
import ExperimentAttributeValue from "~~/server/database/models/ExperimentAttributeValue"

export default defineEventHandler(async (event) => {
  const attributeId = getRouterParam(event, "id")
  const valueSchema = v.object({
    id: v.string(),
    name: v.string(),
  })
  if (!attributeId) {
    throw createError({ status: 400, message: "invalid attribute id" })
  }
  const attribute = await ExperimentAttribute.findOne({
    where: { id: attributeId },
  })
  if (!attribute) {
    throw createError({ status: 404, message: "attribute not found" })
  }
  const newValue = await readValidatedBody(event, body => v.parse(valueSchema, body))
  const createValue = await ExperimentAttributeValue.create({ id: newValue.id, name: newValue.name })
  return attribute.toAddValueListToAttribute(createValue)
})
