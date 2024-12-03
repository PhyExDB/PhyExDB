import { validate as uuidValidate } from "uuid"
import * as v from "valibot"
import Legal from "~~/server/database/models/Legal"

const legalUpdateSchema = v.object({
  name: v.string(),
  content: v.string(),
})

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

  const updateContent = await readValidatedBody(event, body => v.parse(legalUpdateSchema, body))

  return (await document.update(updateContent)).toLegalDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Update a legal document",
    tags: ["Legal"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              content: { type: "string" },
            },
            required: ["name", "content"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The updated legal document",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                content: { type: "string" },
              },
              required: ["id", "name", "content"],
            },
          },
        },
      },
      400: {
        description: "Invalid body",
      },
      404: {
        description: "Document not found",
      },
    },
  },
})
