export default defineEventHandler(async (event) => {
  const newAttributeContent = await readValidatedBody(event, body => experimentAttributeCreateSchema.parse(body))

  const attribute = await prisma.experimentAttribute.create({
    data: {
      name: newAttributeContent.name,
      slug: slugify(newAttributeContent.name),
      values: {
        create: newAttributeContent.values.map(value => ({
          value: value,
          slug: slugify(value),
        })),
      },
    },
    include: { values: true },
  })

  return attribute.toDetail(attribute.values)
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
