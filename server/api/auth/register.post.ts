import * as v from "valibot"
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

  const user = User.build({
    username: registerContent.username,
    email: registerContent.email,
    passwordHash: registerContent.password,
    role: "User",
    verified: false,
  })

  await user.save()
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
