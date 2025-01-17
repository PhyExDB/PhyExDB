import { experimentAttributeValueUpdateSchema } from "~~/shared/types"
import { getSlugOrIdPrismaWhereClause, untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"
import { canEditExperimentAttributes } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  authorize(event, canEditExperimentAttributes)

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

  return result.toList()
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
