import { reportSchema } from "~~/shared/schemas/report.schema"
import { experimentAbilities } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, experimentAbilities.report)

  const experiment = await nullTo404(async () =>
    await prisma.experiment.findFirst({
      where: getSlugOrIdPrismaWhereClause(event),
      select: {
        id: true,
        name: true,
        slug: true,
        userId: true,
      },
    }),
  )

  const body = await readValidatedBody(event, reportSchema.parse)

  const report = await prisma.report.create({
    data: {
      message: body.message.trim(),
      userId: user.id,
      experimentId: experiment.id,
    },
  })

  if (experiment.userId && experiment.userId !== user.id) {
    await createNotification({
      userId: experiment.userId,
      type: "REPORT_NEW",
      title: "Versuch gemeldet",
      message: `Dein Versuch "${experiment.name}" wurde gemeldet.`,
      link: `/experiments/${experiment.slug}`,
      reportId: report.id,
    })
  }

  return { success: true, reportId: report.id }
})

defineRouteMeta({
  openAPI: {
    summary: "Neuen Report für einen Versuch erstellen",
    description: "Erstellt eine Meldung für ein Experiment und benachrichtigt den Besitzer, falls vorhanden.",
    tags: ["Experiments", "Reports"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["message"],
            properties: {
              message: {
                type: "string",
                description: "Der Inhalt der Meldung",
                example: "Dieser Versuch enthält sachliche Fehler.",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Report erfolgreich erstellt",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                reportId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      401: { description: "Nicht authentifiziert" },
      404: { description: "Experiment nicht gefunden" },
    },
  },
})
