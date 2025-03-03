export default defineEventHandler(async (event) => {
  const where = getIdPrismaWhereClause(event)

  const experiment = await prisma.experiment.findUnique({
    where,
  })

  if (experiment === null) {
    throw createError({ status: 404, message: "Experiment to delete not found" })
  }

  await authorize(event, experimentAbilities.delete, experiment)

  await prisma.experiment.delete({
    where,
  })

  return setResponseStatus(event, 204)
})

defineRouteMeta({
  openAPI: {
    description: "Delete an experiment",
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
      204: {
        description: "The experiment has been deleted.",
      },
      401: {
        description: "Not logged in",
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
