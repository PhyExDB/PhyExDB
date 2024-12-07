import { validate as uuidValidate } from "uuid"
import prisma from "~~/lib/prisma"

export default defineEventHandler(async (event) => {
  const slugOrId = getRouterParam(event, "slug")
  if (!slugOrId) {
    throw createError({ status: 400, message: "Invalid slug" })
  }

  const isId = uuidValidate(slugOrId)
  const whereClause = isId ? { id: slugOrId } : { slug: slugOrId }
  const document = await prisma.legalDocument.findFirst({
    where: whereClause,
  })

  if (!document) {
    throw createError({ status: 404, message: "Document not found" })
  }

  // return document.toLegalDetail()
  // TODO: to detail
  return document
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
                name: { type: "string" },
                content: { type: "string" },
              },
              required: ["id", "name", "text"],
            },
          },
        },
      },
      404: {
        description: "Invalid slug",
      },
    },
  },
})
