export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    return {
      needsRevisionCount: 0,
      moderatorNotifications: 0,
      lastRejectedAt: null,
      moderatorLastUpdate: null,
      unreadCount: 0,
      lastNotificationAt: null,
    }
  }

  const [rejected, moderatorData, notificationsData] = await Promise.all([
    prisma.experiment.aggregate({
      where: { userId: user.id, status: "REJECTED" },
      _count: true,
      _max: { updatedAt: true },
    }),

    // Offene Reviews für Moderatoren
    user.role !== "USER"
      ? prisma.experiment.findMany({
          where: { status: "IN_REVIEW", userId: { not: user.id } },
          select: {
            updatedAt: true,
            reviews: {
              where: { reviewerId: user.id },
              orderBy: { updatedAt: "desc" },
              take: 1,
              select: { updatedAt: true, status: true },
            },
          },
        })
      : Promise.resolve([]),

    prisma.notification.aggregate({
      where: { userId: user.id, isRead: false },
      _count: true,
      _max: { createdAt: true },
    }),
  ])

  const relevantModTasks = filterPendingModeratorTasks(user.id, moderatorData as ModeratorTask[])
  const taskTimestamps = relevantModTasks.map(e => new Date(e.updatedAt).getTime())

  return {
    needsRevisionCount: rejected._count,
    lastRejectedAt: rejected._max.updatedAt?.getTime() ?? undefined,

    moderatorNotifications: relevantModTasks.length,
    moderatorLastUpdate: taskTimestamps.length > 0
      ? Math.max(...taskTimestamps)
      : undefined,

    unreadCount: notificationsData._count,
    lastNotificationAt: notificationsData._max.createdAt?.getTime() ?? undefined,
  }
})

defineRouteMeta({
  openAPI: {
    summary: "Status-Zusammenfassung für Benachrichtigungen und Aufgaben",
    description: "Liefert Zählerstände und Zeitstempel für ungelesene Nachrichten, abgelehnte Versuche und offene Reviews.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Status-Zusammenfassung",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                needsRevisionCount: {
                  type: "integer",
                  description: "Anzahl der eigenen Versuche mit Status REJECTED",
                  example: 1,
                },
                lastRejectedAt: {
                  type: "number",
                  description: "Timestamp der letzten Ablehnung",
                  nullable: true,
                  example: 1715856000000,
                },
                moderatorNotifications: {
                  type: "integer",
                  description: "Anzahl der für den Mod relevanten offenen Reviews",
                  example: 3,
                },
                moderatorLastUpdate: {
                  type: "number",
                  description: "Timestamp des neuesten relevanten Review-Updates",
                  nullable: true,
                },
                unreadCount: {
                  type: "integer",
                  description: "Anzahl ungelesener Postfach-Nachrichten",
                  example: 5,
                },
                lastNotificationAt: {
                  type: "number",
                  description: "Timestamp der neuesten ungelesenen Nachricht",
                  nullable: true,
                },
              },
            },
          },
        },
      },
    },
  },
})
