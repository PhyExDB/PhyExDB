import type { ExperimentAttributeDetail } from "~~/shared/types"
import { experimentAttributeUpdateSchema } from "~~/shared/types"
import {
  getSlugOrIdPrismaWhereClause,
  untilSlugUnique,
} from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"
import { experimentAttributeAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeAbilities.put)

  const whereClause = getSlugOrIdPrismaWhereClause(event)

  const content = await readValidatedBody(event, body => experimentAttributeUpdateSchema.parse(body))

  const result = await untilSlugUnique(
    (slug: string) => {
      return prisma.experimentAttribute.update({
        where: whereClause,
        data: { name: content.name, slug: slug },
        include: { values: true },
      })
    },
    slugify(content.name),
  )

  if (!result) {
    throw createError({ status: 404, message: "Attribute not found" })
  }

  return result as ExperimentAttributeDetail
})

defineRouteMeta({
  openAPI: {
    description: "Update the name of an experiment attribute",
    tags: ["ExperimentAttribute"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The updated attributes new name",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                slug: { type: "string" },
                valueList: { type: "array" },
              },
            },
          },
        },
      },
      404: {
        description: "Attribute not found",
      },
    },
  },
})
