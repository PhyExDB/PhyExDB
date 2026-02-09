import prisma from "~~/server/lib/prisma"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)
  const experimentId = getRouterParam(event, "id")
  const userId = user.id

  if (!experimentId) {
    throw createError({ statusCode: 400, statusMessage: "Experiment ID missing" })
  }

  const current = await prisma.favorite.findUnique({
    where: { userId_experimentId: { userId, experimentId } },
    select: { active: true },
  })

  // Toggles between active true and false for the favorite entry. If no entry exists, creates one with active true.
  const result = await prisma.favorite.upsert({
    where: { userId_experimentId: { userId, experimentId } },
    update: { active: !(current?.active ?? false) },
    create: {
      userId,
      experimentId,
      active: true,
      numberForSequence: Math.pow(2, 31) - 1,
    },
    select: { active: true },
  })

  return { favorited: result.active }
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
