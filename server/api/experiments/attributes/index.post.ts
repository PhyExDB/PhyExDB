import { untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"
import type { ExperimentAttributeDetail } from "~~/shared/types"
import { experimentAttributeAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeAbilities.post)

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

  setResponseStatus(event, 201)
  return result as ExperimentAttributeDetail
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
