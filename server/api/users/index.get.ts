import User from "~~/server/database/models/User"

export default defineEventHandler(async () => {
  const users = await User.findAll()

  return users.map(user => user.toUserList())
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of users",
    tags: ["Users"],
    responses: {
      200: {
        description: "A list of users",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  username: { type: "string" },
                  role: { type: "string" },
                  verified: { type: "string", enum: ["User", "Moderator", "Administrator"] },
                },
              },
            },
          },
        },
      },
    },
  },
})
