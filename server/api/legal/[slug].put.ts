import { validate as uuidValidate } from "uuid"
import * as v from "valibot"
import Legal from "~~/server/database/models/Legal"

const legalUpdateSchema = v.object({
  title: v.string(),
  content: v.string(),
})

export default defineEventHandler(async (event) => {
  const slugOrId = getRouterParam(event, "slug")
  if (!slugOrId) {
    throw createError({ status: 400, message: "Invalid slug" })
  }

  const isId = uuidValidate(slugOrId)
  const document = await Legal.findOne({
    where: {
      [isId ? "id" : "slug"]: slugOrId,
    },
  })

  if (!document) {
    throw createError({ status: 404, message: "Document not found" })
  }

  const updateContent = await readValidatedBody(event, body => v.parse(legalUpdateSchema, body))

  return await document.update(updateContent)
})
