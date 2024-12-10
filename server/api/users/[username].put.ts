import * as v from "valibot"
import { readValidatedBody } from "h3"
import { validate as uuidValidate } from "uuid"
import User from "~~/server/database/models/User"
import { getUserByEvent } from "~~/server/utils/user"

const schema = v.object({
  ...usernameSchema,
  ...emailSchema,
})

export default defineEventHandler(async (event) => {
  const user = await getUserByEvent(event)

  const updateUserContent = await readValidatedBody(event, body => v.parse(schema, body))

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
