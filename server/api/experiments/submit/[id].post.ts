export default defineEventHandler(async (event) => {
  const experiment = await prisma.experiment.findFirst({
    where: getIdPrismaWhereClause(event),
    include: experimentIncludeForToDetail,
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  }

  await authorize(event, experimentAbilities.put, experiment)

  prisma.experiment.update({
    where: { id: experiment.id },
    data: {
      status: "IN_REVIEW",
    },
  })
})

defineRouteMeta({
  openAPI: {
    description: "Submits an experiment for review",
    tags: ["Experiment"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "The ID of the experiment",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    responses: {
      200: {
        description: "Experiment submitted successfully",
      },
      400: {
        description: "Invalid slug or ID",
      },
      401: {
        description: "No user is logged in",
      },
      403: {
        description: "Unauthorized",
      },
      404: {
        description: "Experiment not found",
      },
    },
  },
})
