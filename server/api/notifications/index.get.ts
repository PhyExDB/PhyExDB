import type { Prisma } from "@prisma/client"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: "Nicht eingeloggt" })

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const filter = query.filter as string | undefined

  const where: Prisma.NotificationWhereInput = { userId: user.id }
  if (filter === "unread") where.isRead = false
  if (filter === "read") where.isRead = true

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        report: {
          select: { id: true, message: true, createdAt: true },
        },
      },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ])

  return {
    items: notifications,
    unreadCount,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
})
