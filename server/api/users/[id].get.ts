import { getUserByEvent } from "~~/server/utils/user"
import { userAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  await authorize(event, userAbilities.get)

  return (await getUserByEvent(event)) as UserDetail
})

defineRouteMeta({
  openAPI: {
    description: "Returns details for a user",
    tags: ["User"],
    responses: {
      200: {
        description: "User found and details returned",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                role: { type: "string" },
                verified: { type: "string", enum: ["User", "Moderator", "Administrator"] },
                email: { type: "string" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid name",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusCode: { type: "number" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
})
