import { reportSchema } from "~~/shared/schemas/report.schema"
import { experimentAbilities } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.report)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
      select: {
        id: true,
        name: true,
        slug: true,
        userId: true
      },
    }),
  )

  const body = await readValidatedBody(event, reportSchema.parse)

  const report = await prisma.report.create({
    data: {
      message: body.message.trim(),
      userId: user.id,
      experimentId: experiment.id,
    },
  })

  if (experiment.userId && experiment.userId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: experiment.userId,
        type: "REPORT_NEW",
        title: "Versuch gemeldet",
        message: `Dein Versuch "${experiment.name}" wurde gemeldet.`,
        link: `/experiments/${experiment.slug}`,
      },
    })
  }

  return { success: true, reportId: report.id }
})
