import { untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"

export default defineEventHandler(async (event) => {
  const c = await readValidatedBody(event, body => experimentAttributeCreateSchema.parse(body))

  const r = await untilSlugUnique(
    (slug: string) => {
      return prisma.experimentAttribute.create({
        data: {
          name: c.name,
          slug: slugify(c.name),
          values: {
            create: c.values.map(value => ({
              value: value,
              slug: slug,
            })),
          },
        },
        include: { values: true },
      })
    },
    slugify(c.name),
  )

  return r.toDetail(r.values)
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
