import * as v from "valibot"
import { Op } from "sequelize"
import User from "~~/server/database/models/User"

const registerSchema = v.object({
  username: v.pipe(
    v.string(),
    v.nonEmpty("Please enter Name"),
    v.check(
      value =>
        !v.is(v.pipe(
          v.string(),
          v.email(""),
        ), value),
      "Username can't be an email."),
  ),
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
    v.email("The email is badly formatted."),
  ),
  password: v.pipe(
    v.string(), 
    v.nonEmpty("Please enter Password"), 
    v.minLength(8, "Password must be at least 8 characters"), 
    v.regex(/[a-z]/, "Password must contain at least one lowercase letter"), 
    v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"), 
    v.regex(/[0-9]/, "Password must contain at least one number")
  ),
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
        statusCode: 422,
        statusMessage: "Username already exists",
      })
    }
    if (user.email === registerContent.email) {
      throw createError({
        statusCode: 422,
        statusMessage: "Email already exists",
      })
    }
  }
  // todo return tokens
  setResponseStatus(event, 201)
  return user.toUserDetail()
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
