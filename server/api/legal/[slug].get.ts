import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/prisma"
import type { LegalDocumentDetail } from "~~/shared/types"
import { legalAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

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
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "The slug or id of the legal document",
        schema: {
          type: "string",
        },
      },
    ],
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
                slug: { type: "string" },
                text: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      404: {
        description: "Document not found",
      },
    },
  },
})
