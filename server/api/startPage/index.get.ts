export default defineEventHandler(async (event) => {
  const id: boolean = getQuery(event).hasOwnProperty("darkSide") || true

  const result = await prisma.startpage.findUnique({
    where: { id },
    include: {
      files: true,
    },
  })

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
                text: { type: "string" },
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
