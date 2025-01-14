export default defineEventHandler(async (event) => {
  const document = await prisma.legalDocument.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
  })

  if (!document) {
    throw createError({ status: 404, message: "Document not found" })
  }

  return document.toDetail()
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
