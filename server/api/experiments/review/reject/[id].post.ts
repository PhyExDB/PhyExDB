import { reviewRejectSchema } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  await authorizeUser(event, experimentAbilities.review)

  const reviewContent = await readValidatedBody(
    event,
    body => reviewRejectSchema.parse(body),
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
      status: "REJECTED",
      changeRequest: reviewContent.message,
    },
  })
})
