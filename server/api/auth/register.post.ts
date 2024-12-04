import * as v from "valibot"
import { Op } from "sequelize"
import User from "~~/server/database/models/User"

const registerSchema = v.object({
  username: v.string(),
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
    v.email("The email is badly formatted."),
  ),
  password: v.string(),
})

export default defineEventHandler(async (event) => {
  const registerContent = await readValidatedBody(event, body => v.parse(registerSchema, body))

  const [user, created] = await User.findOrCreate({
    where: {
      [Op.or]: [
        { username: registerContent.username },
        { email: registerContent.email },
      ],
    },
    defaults: {
      username: registerContent.username,
      email: registerContent.email,
      passwordHash: registerContent.password,
      role: "User",
      verified: false,
    },
  })

  if (!created) {
    if (user.username === registerContent.username) {
      throw createError({
        statusCode: 400,
        statusMessage: "Username already exists",
      })
    }
    if (user.email === registerContent.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email already exists",
      })
    }
  }
  setResponseStatus(event, 201)
  return {}
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
      },
      400: {
        description: "Invalid body",
      },
    },
  },
})
