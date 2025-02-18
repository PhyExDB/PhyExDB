import type { LegalDocumentDetail } from "~~/shared/types"
import { legalDocumentUpdateSchema } from "~~/shared/types"
import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/utils"
import { legalAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, legalAbilities.put)

  const whereClause = getSlugOrIdPrismaWhereClause(event)
  const document = await prisma.legalDocument.findFirst({
    where: whereClause,
  })

  if (!document) {
    throw createError({ status: 404, message: "Document not found" })
  }

  const updateContent = await readValidatedBody(event, body => legalDocumentUpdateSchema.parse(body))
  updateContent.text = sanitizeHTML(updateContent.text)
  const updatedDocument = await prisma.legalDocument.update({
    where: whereClause,
    data: updateContent,
  })

  return updatedDocument as LegalDocumentDetail
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
              text: { type: "string" },
            },
            required: ["name", "text"],
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
                text: { type: "string" },
              },
              required: ["id", "name", "text"],
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
