export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: "Nicht eingeloggt" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, statusMessage: "ID fehlt" })

  const body = await readBody(event)

  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== user.id) {
    throw createError({ statusCode: 404, statusMessage: "Benachrichtigung nicht gefunden" })
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: body.isRead ?? true },
  })
})
