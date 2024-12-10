import * as v from "valibot"
import bcrypt from "bcrypt"
import User from "~~/server/database/models/User"
import SessionToken from "~~/server/database/models/SessionToken"

const { expSeccondsSession, expSeccondsRefreshToken } = useRuntimeConfig()

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

  const whereClause
    = v.is(v.pipe(v.string(), v.email()), c.usernameOrEmail)
      ? { email: c.usernameOrEmail }
      : { username: c.usernameOrEmail }

  const user = await User.findOne({ where: whereClause })

  if (user == null) {
    authLogger.debug("User not found", { usernameOrEmail: c.usernameOrEmail })
    throw error
  }
  const match = bcrypt.compareSync(c.password, user.passwordHash)
  if (!match) {
    authLogger.debug("Password does not match")
    throw error
  }
  authLogger.debug("Credentials accepted")

  const sessionToken = await SessionToken.create(
    {
      Session: {
        UserId: user.id,
        exp: new Date((new Date()).getTime() + (expSeccondsSession * 1000)),
      },
      valid: true,
      exp: new Date((new Date()).getTime() + (expSeccondsRefreshToken * 1000)),
    },
  )

  const tokens = createTokens(sessionToken.id, user.id)

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
