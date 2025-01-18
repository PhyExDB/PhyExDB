import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/utils"
import type { LegalDocumentDetail } from "~~/shared/types"
import { legalAbilities } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  await authorize(event, legalAbilities.get)

  const document = await prisma.legalDocument.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
  })

  if (!document) {
    throw createError({ status: 404, message: "Document not found" })
  }

  return document as LegalDocumentDetail
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
