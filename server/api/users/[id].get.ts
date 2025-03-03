import { getUserByEvent } from "~~/server/utils/user"
import { userAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"
import { createDatabase } from "@prisma/internals"

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
                role: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                name: { type: "string" },
                email: { type: "string" },
                emailVerified: { type: "boolean" },
                image: { type: "object" },
                banned: { type: "boolean" },
                banReason: { type: "string" },
                banExpires: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      404: {
        description: "Invalid id",
      },
    },
  },
})
