export default defineEventHandler(async (event) => {
  await authorize(event, legalAbilities.put)

  const where = getSlugOrIdPrismaWhereClause(event)

  const updateContent = await readValidatedBody(event, legalDocumentUpdateSchema.parse)
  updateContent.text = sanitizeHTML(updateContent.text)

  const updatedDocument = await prismaRecordNotFoundTo404(async () =>
    prisma.legalDocument.update({
      where,
      data: updateContent,
    }),
  )

  return updatedDocument as LegalDocumentDetail
})

defineRouteMeta({
  openAPI: {
    description: "Update a legal document",
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
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid body",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "Document not found",
      },
    },
  },
})
