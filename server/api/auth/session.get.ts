export default defineEventHandler(async (event) => {
  if (event.context.user == null) {
    throw errorInvalidAccessToken
  }
  return event.context.user
})

defineRouteMeta({
  openAPI: {
    description: "Get user of session",
    tags: ["Auth"],
    responses: {
      200: {
        description: "User",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                username: { type: "string" },
                role: { type: "string" },
                verified: { type: "string", enum: ["User", "Moderator", "Administrator"] },
                email: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
})
