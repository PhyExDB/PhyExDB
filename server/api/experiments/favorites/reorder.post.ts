import prisma from "~~/server/lib/prisma"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)

  const res = await readBody(event)
  const experimentIds: string[] | undefined = res.experimentIds.map((id: any) => String(id))
  const userId = user.id

  if (!experimentIds || !Array.isArray(experimentIds)) {
    throw createError({ statusCode: 400, statusMessage: "Experiment IDs missing or invalid" })
  }

  for (const experimentId of experimentIds) {
    await prisma.favorite.update({
      where: { userId_experimentId: { userId: userId, experimentId: experimentId } },
      data: {
        numberForSequence: experimentIds.indexOf(experimentId),
      },
    })
  }
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
