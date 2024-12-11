import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import * as v from "valibot"

const schema = v.object({
  ...usernameSchema,
  ...emailSchema,
  ...passwordSchema,
})

export default defineEventHandler(async (event) => {
  const c = await readValidatedBody(event, body => v.parse(schema, body))

  try {
    const user = await prisma.user.create({
      data: {
        username: c.username,
        email: c.email,
        passwordHash: await hashPassword(c.password),
        role: "USER",
        verified: false,
      },
    })
    const tokens = await createTokensOfNewSession(user.id)

    const tokensWithUserDetail: TokensWithUserDetail = {
      ...tokens,
      user: user.toDetail(),
    }

    setResponseStatus(event, 201)
    return tokensWithUserDetail
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError
      && error.code === "P2002"
      && error.meta?.target
      && error.meta?.target instanceof Array
    ) {
      const target = error.meta.target
      const isEmail = target.includes("email")
      throw createError({
        statusCode: 422,
        statusMessage: (isEmail ? "Email" : "Username") + " already exists",
      })
    } else {
      throw error
    }
  }
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
