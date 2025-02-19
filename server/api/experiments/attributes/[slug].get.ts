import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/prisma"
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
    description: "Get the values of an attribute (e.g. Versuchsart -> [Freihand, Qualitativ....]",
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
                slug: { type: "string" },
                order: { type: "number" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                valueList: { type: "array" },
              },
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
