import { validate as uuidValidate } from "uuid"
import Users from "~~/server/database/models/User"

export default defineEventHandler(async (event) => {
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
  return user.toUserDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Returns details for a user",
    tags: ["User"],
    responses: {
      200: {
        description: "User found and details returned",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                username: { type: "string" },
                role: { type: "string" },
                verified: { type: "string" },
                email: { type: "string" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid username",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusCode: { type: "number" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
})
