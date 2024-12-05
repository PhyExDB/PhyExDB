import * as v from "valibot"
import { Op } from "sequelize"
import bcrypt from "bcrypt"
import User from "~~/server/database/models/User"

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

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username: c.usernameOrEmail },
        { email: c.usernameOrEmail },
      ],
    },
  })

  if (!user) {
    throw error
  }
  const match = bcrypt.compareSync(c.password, user.passwordHash)
  if (!match) {
    throw error
  }

  // valid login
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
        description: "User created",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                content: { type: "string" },
              },
              required: ["id", "name", "content"],
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
