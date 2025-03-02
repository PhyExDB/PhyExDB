import type { LegalDocumentList } from "~~/shared/types"
import { legalAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, legalAbilities.getAll)

  const documents = await prisma.legalDocument.findMany()

  return documents as LegalDocumentList[]
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of legal documents",
    tags: ["Legal"],
    responses: {
      200: {
        description: "A list of legal documents",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
  },
})
