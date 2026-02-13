import prisma from "~~/server/lib/prisma"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)

  const { experimentIds, category } = await readBody(event)
  const userId = user.id

  if (!experimentIds || !Array.isArray(experimentIds)) {
    throw createError({ statusCode: 400, statusMessage: "Experiment IDs missing or invalid" })
  }

  await prisma.$transaction(
    experimentIds.map((id, index) =>
      prisma.favorite.updateMany({
        where: {
          userId: userId,
          experimentId: id
        },
        data: {
          numberForSequence: index,
          ...(category !== undefined ? { category: category || null } : {}),
        },
      }),
    ),
  )

  return { success: true }
})

defineRouteMeta({
  openAPI: {
    description: "Reorders favorite experiments for the user",
    tags: ["Experiment"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              experimentIds: {
                type: "array",
                items: {
                  type: "string",
                  format: "uuid",
                },
                description: "Array of experiment IDs in the desired order",
              },
              category: {
                type: "string",
                nullable: true,
                description: "Optional category to assign to all these experiments",
              },
            },
            required: ["experimentIds"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Favorite experiments reordered successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {},
            },
          },
        },
      },
      400: {
        description: "Wrong request. One or more experiment IDs are missing or invalid.",
      },
      404: {
        description: "One or more experiments not found",
      },
    },
  },
})
