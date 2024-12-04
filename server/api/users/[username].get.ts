import User from "~~/server/database/models/User"

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username")
  const users = await User.findAll({
    where: { username: username },
  },
  )
  return users.map(user => user.toUserDetail())
})

defineRouteMeta({
  openAPI: {
    description: "Returns details for a userr",
    tags: ["User"],
    requestBody: {
      description: "Username to get details for",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              username: { type: "string" },
            },
            required: ["username"],
          },
        },
      },
    },
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
