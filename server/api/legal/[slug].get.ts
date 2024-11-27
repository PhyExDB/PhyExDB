import { validate as uuidValidate } from "uuid"
import Legal from "~~/server/database/models/Legal"

export default defineEventHandler(async (event) => {
  const slugOrId = getRouterParam(event, "slug")
  if (!slugOrId) {
    throw createError({ status: 400, message: "Invalid slug" })
  }

  const isId = uuidValidate(slugOrId)
  const whereClause = isId ? { id: slugOrId } : { slug: slugOrId }
  const document = await Legal.findOne({
    where: whereClause,
  })

  if (!document) {
    throw createError({ status: 404, message: "Document not found" })
  }

  return document.toLegalDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Get a legal document",
    tags: ["Legal"],
    responses: {
      200: {
        description: "The legal document",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                title: { type: "string" },
                content: { type: "string" },
              },
              required: ["id", "title", "content", "createdAt", "updatedAt"],
            },
          },
        },
      },
      400: {
        description: "Invalid slug",
      },
    },
  },
})
