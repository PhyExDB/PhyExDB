import prisma from "~~/server/utils/prisma"

export default defineEventHandler(async () => {
  const documents = await prisma.legalDocument.findMany()

  return documents.map(document => document.toList())
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
                },
              },
            },
          },
        },
      },
    },
  },
})
