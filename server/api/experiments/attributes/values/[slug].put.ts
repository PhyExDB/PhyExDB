import type { ExperimentAttributeValueList } from "~~/shared/types"
import { experimentAttributeValueUpdateSchema } from "~~/shared/types"
import {
  getSlugOrIdPrismaWhereClause,
  untilSlugUnique,
} from "~~/server/utils/prisma"
import slugify from "~~/server/utils/slugify"
import { experimentAttributeValueAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeValueAbilities.put)

  const whereClause = getSlugOrIdPrismaWhereClause(event)

  const content = await readValidatedBody(event, body => experimentAttributeValueUpdateSchema.parse(body))

  const result = await prismaRecordNotFoundTo404(async () =>
    await untilSlugUnique(
      (slug: string) => {
        return prisma.experimentAttributeValue.update({
          where: whereClause,
          data: { value: content.value, slug: slug },
        })
      },
      slugify(content.value),
    ),
  )

  if (!result) {
    throw createError({ status: 404, message: "Value not found" })
  }

  return result as ExperimentAttributeValueList
})

defineRouteMeta({
  openAPI: {
    description: "Update the name of an attributes value (e.g. Demoversuch changed to KeinDemoversuch)",
    tags: ["ExperimentAttributeValues"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              value: { type: "string", description: "The new name of the attribute value" },
            },
            required: ["value"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The updated name",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                value: { type: "string" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid id",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "Attribute not found",
      },
    },
  },
})
