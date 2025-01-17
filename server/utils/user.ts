import { validate as uuidValidate } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"

/**
 * Finds a user by either their name or id.
 *
 * @param {string} nameOrId The name or id of the user to search for.
 * @returns {Promise<User>} A promise which resolves to the user object if found,
 * or rejects with a 404 error if not found.
 */
export async function getUserByNameOrId(nameOrId: string) {
  const whereClause = uuidValidate(nameOrId) ? { id: nameOrId } : { name: nameOrId }
  const user = await prisma.user.findFirst({ where: whereClause })

  // Check that user exists
  if (!user) {
    throw createError({ status: 404, message: "User not found" })
  }

  return user
}

/**
 * Retrieves a user based on the name or id provided in the event.
 *
 * This function extracts the name or id from the event's route parameters
 * and uses it to find and return the associated user. If the name or id is
 * not present in the event, it throws a 400 error. If no user is found with the
 * given identifier, a 404 error is thrown.
 *
 * @param {H3Event<EventHandlerRequest>} event - The event containing the request context.
 * @returns {Promise<User>} - A promise resolving to the user object.
 * @throws {Error} - Throws a 400 error if the name or id is invalid or not present,
 * and a 404 error if the user is not found.
 */
export async function getUserByEvent(event: H3Event<EventHandlerRequest>) {
  const nameOrId = getRouterParam(event, "id")
  if (!nameOrId) {
    throw createError({ status: 400, message: "Invalid name or id" })
  }
  return getUserByNameOrId(nameOrId)
}
