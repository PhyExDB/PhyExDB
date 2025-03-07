import { ExperimentStatus } from "@prisma/client"
import { getExperimentReadyForReviewSchema } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  const experiment = await prisma.experiment.findFirst({
    where: getIdPrismaWhereClause(event),
    include: experimentIncludeForToDetail,
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  } else if (experiment.status !== ExperimentStatus.DRAFT && experiment.status !== ExperimentStatus.REJECTED) {
    throw createError({ status: 400, message: "Experiment is not in draft or rejected!" })
  }

  await authorize(event, experimentAbilities.put, experiment)

  const sections = await $fetch("/api/experiments/sections")
  const attributes = await $fetch("/api/experiments/attributes")

  const experimentForReview = transformExperimentToSchemaType(mapExperimentToDetail(experiment as ExperimentIncorrectDetail), attributes)

  const experimentReviewSchema = getExperimentReadyForReviewSchema(sections, attributes)
  await experimentReviewSchema.parseAsync(experimentForReview)

  await prisma.experiment.update({
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
      204: {
        description: "Experiment submitted successfully",
      },
      400: {
        description: "Invalid slug or ID or the experiment to submit is not in draft or rejected",
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
