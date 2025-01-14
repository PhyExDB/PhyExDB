export default defineEventHandler(async () => {
  return prisma.experimentSection.count()
})

defineRouteMeta({
  openAPI: {
    description: "Get the number of sections each experiment is required to consist of.",
    tags: ["ExperimentSection"],
    responses: {
      200: {
        description: "The number of sections each experiment is required to consist of",
        content: {
          "application/json": {
            schema: {
              type: "integer",
              example: 7,
            },
          },
        },
      },
    },
  },
})
