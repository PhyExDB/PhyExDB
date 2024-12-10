export default defineEventHandler(async (event) => {
  const session = await acceptRefreshTokenFromEvent(event)

  session.destroy()
})

defineRouteMeta({
  openAPI: {
    description: "logout",
    tags: ["Auth"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              refreshToken: { type: "string", format: "jwt" },
            },
            required: ["refreshToken"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "successfull",
      },
      400: {
        description: "Invalid body",
      },
      401: {
        description: "refreshToken invalid",
      },
    },
  },
})
