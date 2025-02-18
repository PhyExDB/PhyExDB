export default defineEventHandler(async (event) => {
  await authorize(event, legalAbilities.put)

  const where = getSlugOrIdPrismaWhereClause(event)

  const updateContent = await readValidatedBody(event, legalDocumentUpdateSchema.parse)
  updateContent.text = sanitizeHTML(updateContent.text)

  const updatedDocument = await prismaRecordNotFoundTo404(async () =>
    prisma.legalDocument.update({
      where,
      data: updateContent,
    })
  )

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
