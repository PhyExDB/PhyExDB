const { expSeccondsRefreshToken } = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  const session = await acceptRefreshTokenFromEvent(event)

  const newSessionToken = await prisma.sessionToken.create(
    {
      data: {
        sessionId: session.id,
        exp: new Date((new Date()).getTime() + (expSeccondsRefreshToken * 1000)),
      },
    },
  )

  const tokens = createTokens(newSessionToken.id, session.userId)

  return tokens
})

defineRouteMeta({
  openAPI: {
    description: "Get a new refresh and access token with a refresh token",
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
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: { type: "string", format: "jwt" },
                accessToken: { type: "string", format: "jwt" },
              },
              required: ["refreshToken", "accessToken"],
            },
          },
        },
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
