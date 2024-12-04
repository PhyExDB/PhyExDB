import { validate as uuidValidate } from "uuid"
import ExperimentAttribute from "~~/server/database/models/ExperimentAttribute"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  if (!id || !uuidValidate(id)) {
    throw createError({ status: 400, message: "invalid identifier" })
  }
  const attribute = await ExperimentAttribute.findOne({
    where: { id, name },
  })
  if (!attribute) {
    throw createError({ status: 404, message: "Experiment Attribute not found" })
  }
  return attribute.toAttributeList()
})
