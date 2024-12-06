import * as v from "valibot"
import { readValidatedBody } from "h3"
import Users from "~~/server/database/models/User"

export default defineEventHandler(async (event) => {
  // Validate user data
  const userSchema = v.object({
    username: v.pipe(v.string(), v.nonEmpty("Please enter Name")),
    email: v.pipe(v.string(), v.nonEmpty("Please enter Email"), v.email("Not an Email")),
    password: v.pipe(v.string(), v.nonEmpty("Please enter Password"), v.minLength(8, "Password must be at least 8 characters"), v.regex(/[a-z]/, "Password must contain at least one lowercase letter"), v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"), v.regex(/[0-9]/, "Password must contain at least one number")),
  })

  // This is a helper function that reads the body and validates it against the schema
  const newUserContent = await readValidatedBody(event, body => v.parse(userSchema, body))

  // Create new user
  const user = await Users.create({ username: newUserContent.username, email: newUserContent.email, passwordHash: newUserContent.password, verified: false, role: "User" })

  return user.toUserDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Creates a new user",
    tags: ["User"],
    requestBody: {
      description: "User data",
      required: true,
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
      200: {
        description: "User created successfully",
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
        description: "Invalid user data",
      },
    },
  },
})