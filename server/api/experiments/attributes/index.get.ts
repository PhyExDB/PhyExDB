import { experimentAttributeAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeAbilities.getAll)

  const attributes = await prisma.experimentAttribute.findMany({
    include: {
      values: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  })

  return attributes as ExperimentAttributeDetail[]
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of all attributes and their values",
    tags: ["ExperimentAttribute"],
    responses: {
      200: {
        description: "A list of experiment attributes and their values",
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
