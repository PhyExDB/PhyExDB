import prisma from "~~/server/lib/prisma"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: user.id,
      experiment: {
        status: "PUBLISHED",
      },
    },
    include: {
      experiment: {
        include: experimentIncludeForToList,
      },
    },
    orderBy: {
      numberForSequence: "asc",
    },
  })

  return favorites.map((favorite) => {
    const mapped = mapExperimentToList(favorite.experiment as ExperimentIncorrectList)
    return {
      ...mapped,
      isFavorited: true,
      favoriteNumberForSequence: favorite.numberForSequence,
      favoriteCategory: favorite.category,
    }
  })
})

defineRouteMeta({
  openAPI: {
    description: "Get all favorite experiments of the current user",
    tags: ["Experiment"],
    responses: {
      200: {
        description: "A list of favorite experiments",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ExperimentList",
              },
            },
          },
        },
      },
    },
  },
})
