import { experimentAttributeUpdateSchema } from "~~/shared/types"
import { getSlugOrIdPrismaWhereClause, untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"
import { canEditExperimentAttributes } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  authorize(event, canEditExperimentAttributes)

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

  return result.toDetail(result.values)
})

defineRouteMeta({
  openAPI: {
    description: "Update an Experiment Attribute",
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
        description: "The updated Attribute",
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
        description: "Invalid body",
      },
      404: {
        description: "Attribute not found",
      },
    },
  },
})
