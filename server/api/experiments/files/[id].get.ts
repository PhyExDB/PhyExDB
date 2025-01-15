export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    throw createError({ status: 401, message: "Unauthorized" })
  }

  const experimentFileId = getRouterParam(event, "id")

  const experimentFile = await prisma.experimentFile.findFirst({
    where: {
      id: experimentFileId,
    },
    include: {
      experimentSection: {
        include: {
          experiment: true,
        },
      },
      file: {
        include: {
          createdBy: true,
        },
      },
    },
  })

  if (!experimentFile) {
    throw createError({ status: 404, message: "Experiment file not found" })
  }

  await authorize(event, canSeeExperiment, experimentFile.experimentSection.experiment)

  return experimentFile.toDetail(
    experimentFile.file,
    experimentFile.file.createdBy.toDetail(),
  )
})

defineRouteMeta({
  openAPI: {
    description: "Update an experiment file",
    tags: ["Experiment Files"],
    responses: {
      200: {
        description: "The experiment file with the given id",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                description: { type: "string" },
                file: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    description: { type: "string" },
                    file: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "Experiment file not found",
      },
    },
  },
})
