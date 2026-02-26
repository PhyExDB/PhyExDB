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

defineRouteMeta({
  openAPI: {
    summary: "Status einer Benachrichtigung aktualisieren",
    description: "Markiert eine Benachrichtigung als gelesen oder ungelesen. Standardmäßig wird 'isRead' auf true gesetzt.",
    tags: ["Notifications"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "Die ID der Benachrichtigung",
        schema: { type: "string", format: "uuid" },
      },
    ],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              isRead: {
                type: "boolean",
                description: "Der neue Lesestatus",
                default: true,
                example: true,
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Benachrichtigung erfolgreich aktualisiert",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                isRead: { type: "boolean" },
                userId: { type: "string" },
                title: { type: "string" },
                message: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      400: { description: "Ungültige Anfrage (ID fehlt)" },
      401: { description: "Nicht authentifiziert" },
      404: { description: "Benachrichtigung nicht gefunden" },
    },
  },
})
