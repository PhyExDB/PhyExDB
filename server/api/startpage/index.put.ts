export default defineEventHandler(async (event) => {
  await authorize(event, startpageAbilities.put)

  const content = await readValidatedBody(event, startpageSchema.parse)
  const query = getQuery(event)
  const id: boolean = !("darkSide" in query) || true

  await prisma.file.updateMany({
    where: {
      id: {
        in: content.files,
      },
    },
    data: {
      startpageId: id,
    },
  })

  const result = await prisma.startpage.update({
    where: { id },
    data: {
      text: content.text,
    },
    include: {
      files: true,
    },
  })

  return result as Startpage
})

defineRouteMeta({
  openAPI: {
    description: "Update the startpage",
    tags: ["Startpage"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              text: { type: "string" },
              files: {
                type: "array",
                items: {
                  type: "string",
                  format: "uuid",
                },
              },
            },
            required: ["text", "files"],
          },
        },
      },
    },
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
      400: {
        description: "Invalid body",
      },
    },
  },
})
