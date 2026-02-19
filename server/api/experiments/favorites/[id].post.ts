import prisma from "~~/server/lib/prisma"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)
  const experimentId = getRouterParam(event, "id")

  if (!experimentId) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" })
  }

  const userId = user.id
  const existing = await prisma.favorite.findUnique({
    where: { userId_experimentId: { userId, experimentId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return { favorited: false }
  }

  await prisma.favorite.create({
    data: { userId, experimentId, numberForSequence: 2147483647 },
  })

  return { favorited: true }
})

defineRouteMeta({
  openAPI: {
    description: "Highlights an experiment as favorite",
    tags: ["Experiment"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
        },
        description: "The uuid of the experiment",
      },
    ],
    responses: {
      200: {
        description: "Experiment got highlighted as favorite successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                favorited: {
                  type: "boolean",
                  description: "True if experiment is now favorited, false if unfavorited",
                },
              },
            },
          },
        },
      },
      400: {
        description: "Wrong request. Experiment-ID is missing or not valid",
      },
      404: {
        description: "Experiment not found",
      },
    },
  },
})
