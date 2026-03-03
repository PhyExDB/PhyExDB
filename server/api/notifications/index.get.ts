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

defineRouteMeta({
  openAPI: {
    summary: "Benachrichtigungen abrufen",
    description: "Gibt eine paginierte Liste der Benachrichtigungen des aktuellen Nutzers zurück. Filterbar nach Lesestatus.",
    tags: ["Notifications"],
    parameters: [
      {
        name: "page",
        in: "query",
        description: "Die Seitenzahl für die Paginierung",
        schema: { type: "integer", default: 1, example: 1 },
      },
      {
        name: "pageSize",
        in: "query",
        description: "Anzahl der Elemente pro Seite",
        schema: { type: "integer", default: 20, example: 10 },
      },
      {
        name: "filter",
        in: "query",
        description: "Filtert Benachrichtigungen nach Lesestatus",
        schema: {
          type: "string",
          enum: ["read", "unread"],
          nullable: true,
        },
      },
    ],
    responses: {
      200: {
        description: "Paginierte Liste der Benachrichtigungen",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      message: { type: "string" },
                      isRead: { type: "boolean" },
                      type: { type: "string" },
                      link: { type: "string", nullable: true },
                      createdAt: { type: "string", format: "date-time" },
                      report: {
                        type: "object",
                        nullable: true,
                        properties: {
                          id: { type: "string" },
                          message: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
                unreadCount: { type: "integer", example: 5 },
                pagination: {
                  type: "object",
                  properties: {
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      401: { description: "Nicht authentifiziert" },
    },
  },
})
