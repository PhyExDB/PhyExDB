import { getUserByEvent } from "~~/server/utils/user"

export default defineEventHandler(async (event) => {
  return (await getUserByEvent(event)).toUserDetail()
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
                username: { type: "string" },
                role: { type: "string" },
                verified: { type: "string" },
                email: { type: "string" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid username",
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
