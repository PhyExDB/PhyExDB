import { validate as uuidValidate } from "uuid"


export default defineEventHandler(async (event) => {
  const usernameOrId = getRouterParam(event, "username")
  if (!usernameOrId) {
    throw createError({ status: 400, message: "Invalid username or id" })
  }

  // Find user to update
  const isId = uuidValidate(usernameOrId)
  const whereClause = isId ? { id: usernameOrId } : { username: usernameOrId }
  const user = await prisma.user.findFirst({
    where: whereClause,
  })

  // Check that user exists
  if (!user) {
    throw createError({ status: 404, message: "User not found" })
  }

  return user.toDetail()
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
                verified: { type: "string", enum: ["User", "Moderator", "Administrator"] },
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
