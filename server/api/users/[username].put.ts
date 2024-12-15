import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { getUserByEvent } from "~~/server/utils/user"
import { userUpdateSchema } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  const user = await getUserByEvent(event)

  const updateUserContent = await readValidatedBody(event, body => userUpdateSchema.parse(body))

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateUserContent,
    })

    return updatedUser.toDetail()
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002" && error.meta?.target && error.meta?.target instanceof Array) {
        const target = error.meta.target
        const isEmail = target.includes("email")
        throw createError({
          statusCode: 422,
          statusMessage: (isEmail ? "Email" : "Username") + " already exists",
        })
      }
    } else {
      throw error
    }
  }
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
