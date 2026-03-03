export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)
  const id = getRouterParam(event, "id")

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ReportDialog ID fehlt" })
  }

  const report = await prisma.report.findUnique({
    where: { id },
    include: { experiment: { select: { userId: true } } },
  })

  if (!report) {
    throw createError({ statusCode: 404, statusMessage: "ReportDialog nicht gefunden" })
  }

  if (report.experiment.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: "Nicht erlaubt" })
  }

  await prisma.report.update({
    where: { id },
    data: { seenByOwner: true },
  })

  return { success: true }
})

defineRouteMeta({
  openAPI: {
    summary: "Report als erledigt markieren",
    description: "Setzt 'seenByOwner' auf true, sofern der User der Besitzer des Experiments ist.",
    tags: ["Reports"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          example: "550e8400-e29b-41d4-a716-446655440000",
        },
        description: "Die ID des Reports",
      },
    ],
    responses: {
      200: {
        description: "Erfolgreich aktualisiert",
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
      403: { description: "Keine Berechtigung (nicht dein Experiment)" },
      404: { description: "Report nicht gefunden" },
    },
  },
})
