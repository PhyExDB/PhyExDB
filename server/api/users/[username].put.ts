import * as v from "valibot"
import { readValidatedBody } from "h3"
import { validate as uuidValidate } from "uuid"
import Users from "~~/server/database/models/User"

export default defineEventHandler(async (event) => {
  // Extract username or id from the event
  const usernameOrId = getRouterParam(event, "username")
  if (!usernameOrId) {
    throw createError({ status: 400, message: "Invalid username or id" })
  }

  // Find user to update
  const isId = uuidValidate(usernameOrId)
  const whereClause = isId ? { id: usernameOrId } : { username: usernameOrId }
  const user = await Users.findOne({
    where: whereClause,
  })

  // Check that user exists
  if (!user) {
    throw createError({ status: 404, message: "User not found" })
  }

  // Validate user data
  const userSchema = v.object({
    username: v.pipe(v.string(), v.nonEmpty("Please enter Name")),
    email: v.pipe(v.string(), v.nonEmpty("Please enter Email"), v.email("Not an Email")),
  })

  // This is a helper function that reads the body and validates it against the schema
  const updateUserContent = await readValidatedBody(event, body => v.parse(userSchema, body))

  return (await user.update(updateUserContent)).toUserDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Updates a user",
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
            },
            required: ["username", "email"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "User updated sucessfully",
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
