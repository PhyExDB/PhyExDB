import { experimentAttributeValueUpdateSchema } from "~~/shared/types"
import { getSlugOrIdPrismaWhereClause, untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"

export default defineEventHandler(async (event) => {
  const whereClause = getSlugOrIdPrismaWhereClause(event)

  const attributeValue = await prisma.experimentAttributeValue.findFirst({
    where: whereClause,
  })

  if (!attributeValue) {
    throw createError({ status: 404, message: "Value not found" })
  }

  const c = await readValidatedBody(event, body => experimentAttributeValueUpdateSchema.parse(body))

  const r = await untilSlugUnique(
    (slug: string) => {
      return prisma.experimentAttributeValue.update({
        where: whereClause,
        data: { value: c.value, slug: slug },
      })
    },
    slugify(c.value),
  )

  return r.toList()
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
