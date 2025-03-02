export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id: boolean = !("darkSide" in query)

  const result = await prisma.startpage.findUnique({
    where: { id },
    include: {
      files: {
        select: {
          id: true,
          path: true,
          mimeType: true,
          originalName: true,
        },
      },
    },
  })

  if (!result) {
    throw createError({ status: 404, message: "Startpage not found" })
  }

  return result as Startpage
})

defineRouteMeta({
  openAPI: {
    description: "Get the startpage",
    tags: ["Startpage"],
    responses: {
      200: {
        description: "The startpage",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                text: { type: "string" },
                description: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                files: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      path: { type: "string" },
                      mimeType: { type: "string" },
                      originalName: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
})
