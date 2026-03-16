import { mapExperimentToList, experimentIncludeForToList } from "~~/server/utils/experiment"

export default defineEventHandler(async (event) => {
  const user = await getUserOrThrowError(event)

  const reports = await prisma.report.findMany({
    where: {
      experiment: { userId: user.id },
      seenByOwner: false,
    },
    include: {
      experiment: {
        include: experimentIncludeForToList,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return reports.map(report => ({
    ...report,
    experiment: mapExperimentToList(report.experiment),
  }))
})

defineRouteMeta({
  openAPI: {
    summary: "Eigene ungelesene Reports abrufen",
    description: "Gibt alle Reports für Experimente zurück, die dem aktuell angemeldeten User gehören und noch nicht als gelesen markiert wurden.",
    tags: ["Reports"],
    responses: {
      200: {
        description: "Liste der offenen Reports",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  message: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  seenByOwner: { type: "boolean" },
                  experiment: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      slug: { type: "string" },
                      userId: { type: "string" },
                      status: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
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
