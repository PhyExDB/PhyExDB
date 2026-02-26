export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: "Nicht eingeloggt" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, statusMessage: "ID fehlt" })

  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== user.id) {
    throw createError({ statusCode: 404, statusMessage: "Benachrichtigung nicht gefunden" })
  }

  await prisma.notification.delete({ where: { id } })
  return { success: true }
})

defineRouteMeta({
  openAPI: {
    summary: "Benachrichtigung löschen",
    description: "Entfernt eine spezifische Benachrichtigung dauerhaft aus der Datenbank. Der User muss der Eigentümer der Benachrichtigung sein.",
    tags: ["Notifications"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "Die ID der zu löschenden Benachrichtigung",
        schema: {
          type: "string",
          format: "uuid",
          example: "123e4567-e89b-12d3-a456-426614174000",
        },
      },
    ],
    responses: {
      200: {
        description: "Benachrichtigung erfolgreich gelöscht",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      400: { description: "Ungültige Anfrage (ID fehlt)" },
      401: { description: "Nicht authentifiziert" },
      404: { description: "Benachrichtigung nicht gefunden oder Zugriff verweigert" },
    },
  },
})
