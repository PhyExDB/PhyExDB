export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)

  return prisma.report.findMany({
    where: {
      experiment: { userId: user.id },
      seenByOwner: false,
    },
    include: {
      experiment: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
})
