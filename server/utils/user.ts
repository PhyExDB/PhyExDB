import * as v from "valibot"
import { validate as uuidValidate } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"
import User from "~~/server/database/models/User"

export const usernameSchema = {
  username: v.pipe(
    v.string(),
    v.nonEmpty("Please enter Name"),
    v.check(
      value =>
        !v.is(v.pipe(
          v.string(),
          v.email(""),
        ), value),
      "Username can't be an email."),
    v.check(name => !uuidValidate(name), "Invalid username format"),
  ),
}

export const emailSchema = {
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
    v.email("The email is badly formatted."),
  ),
}

export const passwordSchema = {
  password: v.pipe(
    v.string(),
    v.nonEmpty("Please enter Password"),
    v.minLength(8, "Password must be at least 8 characters"),
    v.regex(/[a-z]/, "Password must contain at least one lowercase letter"),
    v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
    v.regex(/[0-9]/, "Password must contain at least one number"),
  ),
}

export async function getUserByUsernameOrId(usernameOrId: string): Promise<User> {
  const whereClause = uuidValidate(usernameOrId) ? { id: usernameOrId } : { username: usernameOrId }
  const user = await User.findOne({ where: whereClause })

  // Check that user exists
  if (!user) {
    throw createError({ status: 404, message: "User not found" })
  }

  return user
}
export async function getUserByEvent(event: H3Event<EventHandlerRequest>): Promise<User> {
  const usernameOrId = getRouterParam(event, "username")
  if (!usernameOrId) {
    throw createError({ status: 400, message: "Invalid username or id" })
  }
  return getUserByUsernameOrId(usernameOrId)
}
