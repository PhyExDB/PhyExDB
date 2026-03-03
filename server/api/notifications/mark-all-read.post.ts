export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: "Nicht eingeloggt" })

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })

  return { success: true }
})

defineRouteMeta({
  openAPI: {
    summary: "Alle Benachrichtigungen als gelesen markieren",
    description: "Setzt den Status 'isRead' für alle ungelesenen Benachrichtigungen des aktuell angemeldeten Benutzers auf true.",
    tags: ["Notifications"],
    responses: {
      200: {
        description: "Alle Benachrichtigungen erfolgreich aktualisiert",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: true,
                },
              },
            },
          },
        },
      },
      401: {
        description: "Nicht authentifiziert - Benutzer muss eingeloggt sein",
      },
    },
  },
})
