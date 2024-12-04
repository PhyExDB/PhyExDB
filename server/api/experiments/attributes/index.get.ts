import ExperimentAttribute from "~~/server/database/models/ExperimentAttribute"

export default defineEventHandler(async () => {
  const attribute = await ExperimentAttribute.findAll()
  return attribute.map(attribute => attribute.toDetailAttributeList())
})
