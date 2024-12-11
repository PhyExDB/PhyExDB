import * as v from "valibot"

const schema = v.object({
  usernameOrEmail: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
  ),
  password: v.string(),
})

const error = createError({
  status: 401,
  message: "Username, email or password wrong",
})

export default defineEventHandler(async (event) => {
  const c = await readValidatedBody(event, body => v.parse(schema, body))

  const isEmail = v.is(v.pipe(v.string(), v.email()), c.usernameOrEmail)
  const whereClause = isEmail ? { email: c.usernameOrEmail } : { username: c.usernameOrEmail }

  const user = await prisma.user.findFirst({ where: whereClause })

  if (user == null) {
    authLogger.debug("User not found", { usernameOrEmail: c.usernameOrEmail })
    throw error
  }
  const match = await comparePassword(c.password, user.passwordHash)
  if (!match) {
    authLogger.debug("Password does not match")
    throw error
  }
  authLogger.debug("Credentials accepted")

  const tokens = createTokensOfNewSession(user.id)

  return tokens
})

defineRouteMeta({
  openAPI: {
    description: "Login User",
    tags: ["Auth"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              usernameOrEmail: { type: "string" },
              password: { type: "string" },
            },
            required: ["usernameOrEmail", "password"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "login successfull",
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
        description: "Username, email or password wrong",
      },
    },
  },
})
