import * as v from "valibot"
import { Op } from "sequelize"
import { validate as uuidValidate } from "uuid"
import User from "~~/server/database/models/User"

const schema = v.object({
  ...usernameSchema,
  ...emailSchema,
  ...passwordSchema,
})

export default defineEventHandler(async (event) => {
  const c = await readValidatedBody(event, body => v.parse(schema, body))

  const [user, created] = await User.findOrCreate({
    where: {
      [Op.or]: [
        { username: c.username },
        { email: c.email },
      ],
    },
    defaults: {
      username: c.username,
      email: c.email,
      passwordHash: c.password,
      role: "User",
      verified: false,
    },
  })

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
