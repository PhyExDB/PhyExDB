import { experimentAttributeAbilities } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeAbilities.getAll)

  const attributes = await prisma.experimentAttribute.findMany({
    include: { values: true },
  })

  return attributes.map(attribute => attribute.toDetail(attribute.values))
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
