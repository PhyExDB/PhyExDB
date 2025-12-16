import prisma from "~~/server/lib/prisma" // Korrekter Pfad zu deiner Prisma-Instanz

export default defineEventHandler(async (event) => {
    // 1. Benutzerprüfung & Session
    // Nutzt die projektinterne Methode, die automatisch 401 wirft, wenn nicht eingeloggt
    const user = await getUserOrThrowError(event)

    const experimentId = getRouterParam(event, 'id')
    const userId = user.id // 'user' kommt direkt aus deiner DB-Struktur

    if (!experimentId) {
        throw createError({ statusCode: 400, statusMessage: "Experiment ID missing" })
    }

    // 2. Prüfen, ob Favorit schon existiert
    const existing = await prisma.favorite.findUnique({
        where: {
            userId_experimentId: {
                userId: userId,
                experimentId: experimentId
            }
        }
    })

    if (existing) {
        // Wenn vorhanden -> löschen (Unfavorite)
        await prisma.favorite.delete({
            where: { id: existing.id }
        })
        return { favorited: false }
    } else {
        // Wenn nicht vorhanden -> erstellen (Favorite)
        await prisma.favorite.create({
            data: {
                userId: userId,
                experimentId: experimentId
            }
        })
        return { favorited: true }
    }
})

defineRouteMeta({
    openAPI:{
        description: "Highlights an experiment as favorite",
        tags: ["Experiment"],
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                    format: "uuid"
                },
                description: "The uuid of the experiment"
            }
        ],
        responses:{
            200: {
                description: "Experiment got highlighted as favorite successfully",
                content: {
                    "application/json":{
                        schema: {
                            type: "object",
                            properties:{
                                favorited: {
                                    type: "boolean",
                                    description: "True if it is not a favorite, false if not"
                                }
                            }
                        }
                    }
                }
            },
            400: {
                description: "Wrong request. Experiment-ID is missing or not valid"
            },
            404: {
                description: "Experiment not found"
            }
        }
    }
})