import ExperimentAttribute from "~~/server/database/models/ExperimentAttribute"

export default defineEventHandler(async () => {
  const attribute = await ExperimentAttribute.findAll()
  return attribute.map(attribute => attribute.toAttributeDetail())
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
