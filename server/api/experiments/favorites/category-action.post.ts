export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)
  const { action, oldName, newName } = await readBody(event)
  const userId = user.id

  if (action === "rename") {
    if (!newName) throw createError({ statusCode: 400, statusMessage: "Neuer Name fehlt" })

    const exists = await prisma.favorite.findFirst({
      where: { userId, category: newName },
    })
    if (exists) throw createError({ statusCode: 400, statusMessage: "Kategorie existiert bereits" })

    await prisma.favorite.updateMany({
      where: { userId, category: oldName },
      data: { category: newName },
    })
  }

  if (action === "delete") {
    await prisma.favorite.updateMany({
      where: { userId, category: oldName },
      data: { category: null },
    })
  }

  return { success: true }
})

defineRouteMeta({
  openAPI: {
    summary: "Verwaltet Favoriten-Kategorien (Umbenennen/Löschen)",
    description: "Ermöglicht das massenweise Umbenennen oder Zurücksetzen (Löschen) von Kategorien für die Favoriten eines Benutzers.",
    tags: ["Experiment"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["action", "oldName"],
            properties: {
              action: {
                type: "string",
                enum: ["rename", "delete"],
                description: "Die auszuführende Aktion",
              },
              oldName: {
                type: "string",
                description: "Der aktuelle Name der Kategorie",
              },
              newName: {
                type: "string",
                nullable: true,
                description: "Der neue Name (nur erforderlich bei Aktion 'rename')",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Aktion erfolgreich ausgeführt",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
              },
            },
          },
        },
      },
      400: {
        description: "Fehlende Parameter oder Kategorie existiert bereits",
      },
      401: {
        description: "Nicht autorisiert",
      },
    },
  },
})
