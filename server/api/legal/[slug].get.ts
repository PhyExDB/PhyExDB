import { validate as uuidValidate } from "uuid"
import Legal from "~~/server/database/models/Legal"

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

  return document.toLegalDetail()
})
