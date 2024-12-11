import * as v from "valibot"

const schema = v.object({
  ...usernameSchema,
  ...emailSchema,
  ...passwordSchema,
})

export default defineEventHandler(async (event) => {
  const c = await readValidatedBody(event, body => v.parse(schema, body))

  const user = await prisma.user.create({
    data: {
      username: c.username,
      email: c.email,
      passwordHash: c.password,
      role: "USER",
      verified: false,
    },
  })

  const created = true
  if (!created) {
    if (user.username === c.username) {
      throw createError({
        statusCode: 422,
        statusMessage: "Username already exists",
      })
    }
    if (user.email === c.email) {
      throw createError({
        statusCode: 422,
        statusMessage: "Email already exists",
      })
    }
  }

  const tokens = await createTokensOfNewSession(user.id)

  const tokensWithUserDetail: TokensWithUserDetail = {
    ...tokens,
    user: user.toDetail(),
  }

  setResponseStatus(event, 201)
  return tokensWithUserDetail
})

defineRouteMeta({
  openAPI: {
    description: "Register User",
    tags: ["Auth"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              username: { type: "string" },
              email: { type: "string" },
              password: { type: "string" },
            },
            required: ["username", "email", "password"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "User created",
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
      400: {
        description: "Invalid body",
      },
    },
  },
})
