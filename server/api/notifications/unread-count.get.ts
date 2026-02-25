export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) return { count: 0 }

  const count = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  })

  return { count }
})
