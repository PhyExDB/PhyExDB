export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) return { count: 0 }

  const count = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  })

  return { count }
})

defineRouteMeta({
  openAPI: {
    summary: "Anzahl ungelesener Benachrichtigungen abrufen",
    description: "Liefert die reine Anzahl der ungelesenen Benachrichtigungen für den aktuellen User. Wenn nicht eingeloggt, wird 0 zurückgegeben.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Anzahl der ungelesenen Benachrichtigungen",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                count: {
                  type: "integer",
                  example: 3,
                  description: "Die Anzahl der Nachrichten mit isRead: false",
                },
              },
            },
          },
        },
      },
    },
  },
})
