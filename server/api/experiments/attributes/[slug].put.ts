import { experimentAttributeUpdateSchema } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  const whereClause = getSlugOrIdPrismaWhereClause(event)

  const attribute = await prisma.experimentAttribute.findFirst({
    where: whereClause,
    include: { values: true },
  })

  if (!attribute) {
    throw createError({ status: 404, message: "Attribute not found" })
  }

  const c = await readValidatedBody(event, body => experimentAttributeUpdateSchema.parse(body))

  const r = await untilSlugUnique(
    (slug: string) => {
      return prisma.experimentAttribute.update({
        where: whereClause,
        data: { name: c.name, slug: slug },
        include: { values: true },
      })
    },
    slugify(c.name),
  )

  return r.toDetail(r.values)
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
