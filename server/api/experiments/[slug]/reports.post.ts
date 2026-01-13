import {experimentReportSchema} from "~~/server/schemas/experimentReportSchema";

export default defineEventHandler(async (event) => {
    //  User autorisieren
    const user = await authorizeUser(event, experimentAbilities.report)

    // Body validieren
    const content = await readValidatedBody(
        event,
        experimentReportSchema.parse
    )

    // Experiment anhand Slug oder ID holen
    const experiment = await nullTo404(async () =>
        await prisma.experiment.findFirst({
            where: getSlugOrIdPrismaWhereClause(event),
        })
    )

    //  Report in DB speichern
    const report = await prisma.report.create({
        data: {
            experimentId: experiment.id,
            userId: user.id,
            message: content.message,
        },
    })

    return report
})

//  OpenAPI Meta für Dokumentation
defineRouteMeta({
    openAPI: {
        description: "Report an experiment",
        tags: ["ExperimentReport"],
        parameters: [
            {
                name: "slug",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
        ],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: { type: "string" },
                        },
                        required: ["message"],
                    },
                },
            },
        },
        responses: {
            200: { description: "Report created successfully" },
            400: { description: "Invalid input" },
            401: { description: "Not logged in" },
            403: { description: "Unauthorized" },
            404: { description: "Experiment not found" },
        },
    },
})
