import * as v from "valibot"


const valueUpdateSchema = v.object({
  name: v.string(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ status: 400, message: "Invalid id" })
  }

  const document = await prisma.experimentAttributeValue.findFirst({
    where: { id: id },
  })

  if (!document) {
    throw createError({ status: 404, message: "Value not found" })
  }

  const updateName = await readValidatedBody(event, body => v.parse(valueUpdateSchema, body))

  const updatedValue = await prisma.experimentAttributeValue.update({
    where: { id: id },
    data: { name: updateName.name },
  })

  return updatedValue.toDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Update an Experiment Value",
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
        description: "Invalid body",
      },
      404: {
        description: "Value not found",
      },
    },
  },
})
