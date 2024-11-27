import Legal from "~~/server/database/models/Legal"

export default defineEventHandler(async () => {
  const documents = await Legal.findAll()

  return documents.map(document => document.toLegalList())
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
