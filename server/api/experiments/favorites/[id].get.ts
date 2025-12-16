export default defineEventHandler (async (event) => {
    const user = await getUserOrThrowError(event)
    const userId = user.id

    const favorites = await prisma.favorite.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return favorites
})

defineRouteMeta({
    openAPI: {
        summary: "Get all favorites of the User",
        description: "Returns a List of all favorites from the current user",
        tags: ["Experiment"],
        responses: {
            200: {
                description: "List of all favorites from the user loaded successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string", format: "uuid" },
                                    userId: { type: "string", format: "uuid" },
                                    experimentId: { type: "string", format: "uuid" },
                                    createdAt: { type: "string", format: "date-time" }
                                }
                            }
                        }
                    }
                }
            },
            401: {
                description: "Not authorisized. User must be logged in"
            }
        }
    }
})