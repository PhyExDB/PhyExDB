import { untilSlugUnique } from "~~/server/utils/prisma"
import slugify from "~~/server/utils/slugify"
import type { ExperimentAttributeDetail } from "~~/shared/types"
import { experimentAttributeAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeAbilities.post)

  const content = await readValidatedBody(event, body => experimentAttributeCreateSchema.parse(body))

  const existingAttribute = await prisma.experimentAttribute.findFirst({
    where: {
      name: {
        equals: content.name,
        mode: "insensitive",
      },
    },
  })

  if (existingAttribute) {
    throw createError({
      status: 409,
      message: "Eine Kategorie mit diesem Namen existiert bereits.",
    })
  }

  const numberOfAttributes = await prisma.experimentAttribute.count()

  const result = await untilSlugUnique(
    (slug: string) => {
      return prisma.experimentAttribute.create({
        data: {
          name: content.name,
          slug: slugify(content.name),
          order: numberOfAttributes,
          multipleSelection: content.multipleSelection,
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
    description: "Create a new experiment attribute with values for the attribute",
    tags: ["ExperimentAttribute"],
    responses: {
      201: {
        description: "The newly created attribute with its values",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  order: { type: "number" },
                  multipleSelection: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                  valueList: { type: "array" },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid request/JSON body",
      },
      409: {
        description: "Attribute with this name already exists",
      },
    },
  },
})
