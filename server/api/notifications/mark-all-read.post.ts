export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: "Nicht eingeloggt" })

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })

  return { success: true }
})
