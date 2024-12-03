import { validate as uuidValidate } from "uuid"
import * as v from "valibot"
import { readBody, createError, getRouterParam } from "h3"
import Users from "~~/server/database/models/User"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = getRouterParam(event, "user")
  if (!user) {
    throw createError({ status: 400, message: "Invalid user" })
  }

  const isId = uuidValidate(user)
  if (!isId) {
    throw createError({ status: 400, message: "Invalid user ID" })
  }

  const userData = {
    name: body.name,
    email: body.email,
    password: body.password,
  }

  // Validate user data
  const userSchema = v.object({
    name: v.string(),
    email: v.pipe(v.string(), v.nonEmpty("Please enter Email"), v.email("Not an Email")),
    password: v.pipe(v.string(), v.nonEmpty("Please enter Password"), v.minLength(8, "Password must be at least 8 characters"), v.regex(/[a-z]/, "Password must contain at least one lowercase letter"), v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"), v.regex(/[0-9]/, "Password must contain at least one number")),
  })

  const validation = v.safeParse(userSchema, userData)
  if (!validation.success) {
    throw createError({ status: 400, message: "Invalid user data" })
  }

  // Create new user
  const newUser = await Users.create(userData)

  return {
    message: "User created successfully",
    user: newUser,
  }
})
