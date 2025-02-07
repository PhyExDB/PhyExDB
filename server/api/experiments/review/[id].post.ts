import { experimentReviewSchema } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  await authorizeUser(event, experimentAbilities.review)

  const reviewContent = await readValidatedBody(
    event,
    body => experimentReviewSchema.parse(body),
  )

  const experiment = await prisma.experiment.findFirst({
    where: getIdPrismaWhereClause(event),
    include: experimentIncludeForToDetail,
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Experiment not found!" })
  }

  await prisma.experiment.update({
    where: { id: experiment.id },
    data: {
      status: reviewContent.approve ? "PUBLISHED" : "REJECTED",
      changeRequest: reviewContent.message,
    },
  })
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
