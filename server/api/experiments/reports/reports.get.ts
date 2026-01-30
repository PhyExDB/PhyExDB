export default defineEventHandler(async (event) => {
  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
    }),
  )

  const reports = await prisma.report.findMany({
    where: {
      experimentId: experiment.id,
    },
  })

  if (reports.length === 0) {
    return false
  }

  return reports
})
