import {description} from "valibot";

export default defineEventHandler (async (event) =>{
    const user = await getUserOrThrowError(event);
    const userId = user.id;
    const experimentId = await getRouterParam(event, "id")

    if(!experimentId){
        throw createError({statusCode: 400, statusMessage: "Experiment ID missing"})
    }

    try {
        prisma.favorite.delete({
            where: {
                id: experimentId,
                userId: userId
            }
        })
        return { success: true, message: "Favorite deleted successfully"}
    } catch (error){
        throw createError({statusCode: 404, statusMessage: "Favorite not found"})
    }
})

defineRouteMeta({
    openAPI:{
        description: "Deletes the highlight from an experiement",
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
        responses: {
            200: {
                description: "Experimenthighlight removed successfully",
                content: {
                    "application/json":{
                        schema: {
                            type: "object",
                            properties: {
                                favorited: {
                                    type: "boolean",
                                    description: "True if favorite got removed successfully, false if not"
                                }
                            }
                        }
                    }
                }
            },
            400: {description: "Experiment ID missing"},
            404: {description: "Favorite, that should be deleted not found"}
        }

}}
)