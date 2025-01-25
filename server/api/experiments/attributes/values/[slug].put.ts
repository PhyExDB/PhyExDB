import type { ExperimentAttributeValueList } from "~~/shared/types"
import { experimentAttributeValueUpdateSchema } from "~~/shared/types"
import {
  getSlugOrIdPrismaWhereClause,
  untilSlugUnique,
} from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"
import { experimentAttributeValueAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeValueAbilities.put)

  const whereClause = getSlugOrIdPrismaWhereClause(event)

  const content = await readValidatedBody(event, body => experimentAttributeValueUpdateSchema.parse(body))

  const result = await untilSlugUnique(
    (slug: string) => {
      return prisma.experimentAttributeValue.update({
        where: whereClause,
        data: { value: content.value, slug: slug },
      })
    },
    slugify(content.value),
  )

  if (!result) {
    throw createError({ status: 404, message: "Value not found" })
  }

  return result as ExperimentAttributeValueList
})

defineRouteMeta({
  openAPI: {
    description: "Update an Experiment Value",
    tags: ["ExperimentAttributeValues"],
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
        description: "The updated Value",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
              required: ["id", "name"],
            },
          },
        },
      },
      400: {
        description: "Invalid id",
      },
      404: {
        description: "Value not found",
      },
    },
  },
})
