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
    const revisionOf = experiment.revisionOf
    if (revisionOf !== null && revisionOf !== undefined) {
      if (!reviewContent.deleteRatingsAndComments) {
        // adopt ratings and comments from old version
        await prisma.$transaction(async () => {
          // delete ratings that where made on the draft
          await prisma.rating.deleteMany({
            where: {
              experimentId: experiment.id,
            },
          })
          // copy ratings from previous version
          await prisma.rating.updateMany({
            where: {
              experimentId: revisionOf.id,
            },
            data: {
              experimentId: experiment.id,
            },
          })
          // copy comments
          await prisma.comment.updateMany({
            where: {
              experimentId: revisionOf.id,
            },
            data: {
              experimentId: experiment.id,
            },
          })
          const exp = await prisma.experiment.delete({
            where: {
              id: revisionOf.id,
            },
          })
          await prisma.experiment.update({
            where: { id: experiment.id },
            data: {
              ratingsSum: exp.ratingsSum,
              ratingsCount: exp.ratingsCount,
            },
          })
        })
      } else {
        await prisma.experiment.delete({
          where: {
            id: revisionOf.id,
          },
        })
      }
    }
    // Publish new version under same slug if the title is the same
    await prisma.experiment.update({
      where: { id: experiment.id },
      data: {
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
        name: "slug",
        in: "path",
        required: true,
        description: "The ID or slug of the experiment",
        schema: {
          type: "string",
          format: "uuid", // Format not for slug, how to document?
        },
      },
    ],
    requestBody: {
      description: "If the experiment is approved, it will be published. If it is rejected, a message must be provided.",
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
      204: {
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
