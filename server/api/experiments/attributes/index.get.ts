export default defineEventHandler(async () => {
  const attributes = await prisma.experimentAttribute.findMany({
    include: { values: true },
  })

  return attributes as ExperimentAttributeDetail[]
})

defineRouteMeta({
  openAPI: {
    description: "Get a List with Attributes and their Values",
    tags: ["ExperimentAttribute"],
    responses: {
      200: {
        description: "A list of Experiment Attributes and their Values",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  valueList: { type: "array" },
                },
              },
            },
          },
        },
      },
    },
  },
})
