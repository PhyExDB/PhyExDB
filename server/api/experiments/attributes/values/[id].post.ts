export default defineEventHandler(async (event) => {
  const c = await readValidatedBody(event, body => experimentAttributeValueCreateSchema.parse(body))

  const r = await prisma.experimentAttributeValue.create({
    data: {
      value: c.value,
      slug: slugify(c.value),
      attribute: {
        connect: { id: c.attribute },
      },
    },
  })

  return r.toList()
})
