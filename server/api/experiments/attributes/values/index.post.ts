import { untilSlugUnique } from "~~/server/utils/utils"
import slugify from "~~/server/utils/slugify"
import type { ExperimentAttributeValueList } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  const content = await readValidatedBody(event, body => experimentAttributeValueCreateSchema.parse(body))

  const result = await untilSlugUnique(
    (slug: string) => {
      return prisma.experimentAttributeValue.create({
        data: {
          value: content.value,
          slug: slug,
          attribute: {
            connect: { id: content.attribute },
          },
        },
      })
    },
    slugify(content.value),
  )

  setResponseStatus(event, 201)
  return result as ExperimentAttributeValueList
})

defineRouteMeta({
  openAPI: {
    description: "Create new Value to an existing attribute",
    tags: ["ExperimentAttributeValues"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              value: { type: "string" },
              attribute: { type: "string", format: "uuid" },
            },
            required: ["value", "attribute"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The created value",
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
    },
  },
})
