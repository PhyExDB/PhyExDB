import * as v from "valibot"
import { validate as uuidValidate } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"
import User from "~~/server/database/models/User"

/**
 * Schema to verify username
 */
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

/**
 * Schema to verify email
 */
export const emailSchema = {
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
    v.email("The email is badly formatted."),
  ),
}

/**
 * Schema to verify password
 */
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

/**
 * Finds a user by either their username or id.
 *
 * @param {string} usernameOrId The username or id of the user to search for.
 * @returns {Promise<User>} A promise which resolves to the user object if found, or rejects with a 404 error if not found.
 */
export async function getUserByUsernameOrId(usernameOrId: string): Promise<User> {
  const whereClause = uuidValidate(usernameOrId) ? { id: usernameOrId } : { username: usernameOrId }
  const user = await User.findOne({ where: whereClause })

  // Check that user exists
  if (!user) {
    throw createError({ status: 404, message: "User not found" })
  }

  return user
}

/**
 * Retrieves a user based on the username or id provided in the event.
 *
 * This function extracts the username or id from the event's route parameters
 * and uses it to find and return the associated user. If the username or id is
 * not present in the event, it throws a 400 error. If no user is found with the
 * given identifier, a 404 error is thrown.
 *
 * @param {H3Event<EventHandlerRequest>} event - The event containing the request context.
 * @returns {Promise<User>} - A promise resolving to the user object.
 * @throws {Error} - Throws a 400 error if the username or id is invalid or not present,
 * and a 404 error if the user is not found.
 */
export async function getUserByEvent(event: H3Event<EventHandlerRequest>): Promise<User> {
  const usernameOrId = getRouterParam(event, "username")
  if (!usernameOrId) {
    throw createError({ status: 400, message: "Invalid username or id" })
  }
  return getUserByUsernameOrId(usernameOrId)
}
