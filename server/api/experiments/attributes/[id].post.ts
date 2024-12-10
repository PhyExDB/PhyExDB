import * as v from "valibot"
import prisma from "~~/lib/prisma"

const valueSchema = v.object({
  id: v.string(),
  name: v.string(),
})
export default defineEventHandler(async (event) => {
  const attributeId = getRouterParam(event, "id")
  if (!attributeId) {
    throw createError({ status: 400, message: "Invalid attribute id" })
  }
  const attribute = await prisma.experimentAttribute.findFirst({
    where: { id: attributeId },
  })
  if (!attribute) {
    throw createError({ status: 404, message: "Attribute not found" })
  }
  const newValue = await readValidatedBody(event, body => v.parse(valueSchema, body))
  const attributeValue = await prisma.experimentAttributeValue.create({
    data: {
      name: newValue.name,
      attribute: { connect: { id: attributeId } },
    },
  })

  // .create({ id: newValue.id, name: newValue.name, attributeValue: attributeId })
  // return attribute.toAttributeDetailWithAdditionalValue(createValue)
  // TODO: to detail
  return attributeValue
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
