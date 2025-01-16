import { untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"

export default defineEventHandler(async (event) => {
  const content = await readValidatedBody(event, body => experimentAttributeCreateSchema.parse(body))

  const result = await untilSlugUnique(
    (slug: string) => {
      return prisma.experimentAttribute.create({
        data: {
          name: content.name,
          slug: slugify(content.name),
          values: {
            create: content.values.map(value => ({
              value: value,
              slug: slug,
            })),
          },
        },
        include: { values: true },
      })
    },
    slugify(content.name),
  )

  return result.toDetail(result.values)
})

defineRouteMeta({
  openAPI: {
    description: "Create new Value to an existing attribute",
    tags: ["ExperimentAttribute"],
    responses: {
      200: {
        description: "A list of the attribute with the addition of the created value",
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
