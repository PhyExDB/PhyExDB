import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/utils"
import type { ExperimentAttributeDetail } from "~~/shared/types"
import { experimentAttributeAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeAbilities.get)

  const attribute = await prisma.experimentAttribute.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
    include: {
      values: {
        orderBy: { value: "asc" },
      },
    },
  })

  if (!attribute) {
    throw createError({ status: 404, message: "Attribute not found" })
  }

  return attribute as ExperimentAttributeDetail
})

defineRouteMeta({
  openAPI: {
    description: "Get the values per Attribute",
    tags: ["ExperimentAttribute"],
    responses: {
      200: {
        description: "The values",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                valueList: { type: "array" },
              },
              required: ["id", "name", "valueList"],
            },
          },
        },
      },
      404: {
        description: "Invalid slug",
      },
    },
  },
})
