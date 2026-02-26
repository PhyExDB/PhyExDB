import type { NotificationType } from "@prisma/client"
import { ExperimentStatus } from "@prisma/client"
import { getExperimentReadyForReviewSchema } from "~~/shared/types"
import { transformExperimentToSchemaType } from "~~/shared/types/Experiment.type"
import { authorize } from "~~/server/utils/authorization"
import { getModeratorIds } from "~~/server/utils/moderation"

export default defineEventHandler(async (event) => {
  const experiment = await prisma.experiment.findFirst({
    where: getIdPrismaWhereClause(event),
    include: {
      ...experimentIncludeForToDetail,
    },
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  } else if (experiment.status !== ExperimentStatus.DRAFT && experiment.status !== ExperimentStatus.REJECTED) {
    throw createError({ status: 400, message: "Experiment is not in draft or rejected!" })
  }

  await authorize(event, experimentAbilities.put, experiment)

  const sections = await $fetch("/api/experiments/sections")
  const attributes = await $fetch("/api/experiments/attributes")

  // Map experiment to type-safe domain model
  const experimentDetail = mapExperimentToDetail(experiment)

  // Transform to schema type for validation
  const experimentForReview = transformExperimentToSchemaType(experimentDetail, attributes)

  // Validate against schema
  const experimentReviewSchema = getExperimentReadyForReviewSchema(sections, attributes)
  await experimentReviewSchema.parseAsync(experimentForReview)

  const moderatorIds = await getModeratorIds(experiment.userId)

  await prisma.$transaction(async (tx) => {
    await tx.experiment.update({
      where: { id: experiment.id },
      data: { status: "IN_REVIEW" },
    })

    if (moderatorIds.length > 0) {
      await tx.notification.createMany({
        data: moderatorIds.map(id => ({
          userId: id,
          type: "REVIEW_ASSIGNED" satisfies NotificationType,
          title: "Review ausstehend",
          message: `Ein neuer Versuch ("${experiment.name}") wartet auf Prüfung.`,
          link: `/experiments/review`,
        })),
      })
    }
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
