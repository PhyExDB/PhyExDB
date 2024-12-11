

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany()

  return users.map(user => user.toList())
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of users",
    tags: ["User"],
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
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
      },
    },
  },
})
