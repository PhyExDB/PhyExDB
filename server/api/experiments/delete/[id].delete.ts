export default defineEventHandler(async (event) => {
  const experimentId = getRouterParam(event, "id")

  const experiment = await prisma.experiment.findUnique({
    where: {
      id: experimentId,
    },
  })
  console.log(experimentId)
  console.log(experiment)
  if (experiment === null) {
    throw createError({ status: 404, message: "Experiment to delete not found" })
  }

  await prisma.experiment.delete({
    where: {
      id: experimentId,
    },
  })

  return setResponseStatus(event, 204)
})

defineRouteMeta({
  openAPI: {
    description: "Delete an experiment",
    tags: ["Experiment"],
    responses: {
      204: {
        description: "The experiment has been deleted.",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "Experiment not found",
      },
    },
  },
})
