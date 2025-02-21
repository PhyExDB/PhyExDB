import { ExperimentStatus } from "@prisma/client"
import { experimentReviewSchema } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  await authorizeUser(event, experimentAbilities.review)

  const reviewContent = await readValidatedBody(
    event,
    body => experimentReviewSchema.parse(body),
  )

  const experiment = await prisma.experiment.findFirst({
    where: getSlugOrIdPrismaWhereClause(event),
    include: {
      revisionOf: {
        select: {
          id: true,
          slug: true,
          name: true,
          ratingsSum: true,
          ratingsCount: true,
        },
      },
    },
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  } else if (experiment.status !== ExperimentStatus.IN_REVIEW) {
    throw createError({ status: 400, message: "Experiment is not in review!" })
  }

  if (reviewContent.approve) {
    // Delete old version if revision
    const isRevision = experiment.revisionOf !== null
    let ratings = {}
    if (isRevision) {
      // fix ratings
      // delete ratings that where made on the draft
      await prisma.rating.deleteMany({
        where: {
          experimentId: experiment.id,
        },
      })
      // copy ratings from previous version
      await prisma.rating.updateMany({
        where: {
          experimentId: experiment.revisionOf!.id,
        },
        data: {
          experimentId: experiment.id,
        },
      })
      ratings = {
        ratingsSum: experiment.revisionOf!.ratingsSum,
        ratingsCount: experiment.revisionOf!.ratingsCount,
      }

      await prisma.experiment.delete({
        where: {
          id: experiment.revisionOf!.id,
        },
      })
    }
    // Publish new version under same slug if the title is the same
    await prisma.experiment.update({
      where: { id: experiment.id },
      data: {
        ...ratings,
        status: "PUBLISHED",
        slug: experiment.name === experiment.revisionOf?.name
          ? experiment.revisionOf?.slug
          : experiment.slug,
      },
    })
  } else {
    // Reject experiment with change request
    await prisma.experiment.update({
      where: { id: experiment.id },
      data: {
        status: "REJECTED",
        changeRequest: reviewContent.message,
      },
    })
  }
})

defineRouteMeta({
  openAPI: {
    description: "Approves or rejects an experiment",
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
    requestBody: {
      description: "Review content",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              approve: { type: "boolean" },
              message: { type: "string" },
            },
            required: ["approve"],
          },
        },
      },
    },
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
