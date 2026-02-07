import prisma from "~~/server/lib/prisma"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)

  const { experimentId, category } = await readBody(event)
  const userId = user.id

  if (!experimentId) {
    throw createError({ statusCode: 400, statusMessage: "Experiment ID missing" })
  }

  await prisma.favorite.update({
    where: { userId_experimentId: { userId, experimentId } },
    data: { category: category || null },
  })

  return { success: true }
})

defineRouteMeta({
  openAPI: {
    description: "Updates the category of a favorite experiment",
    tags: ["Experiment"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              experimentId: { type: "string", format: "uuid" },
              category: { type: "string", nullable: true },
            },
            required: ["experimentId"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Category updated successfully",
      },
    },
  },
})
