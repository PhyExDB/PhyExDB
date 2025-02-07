import type { Event } from "./utils"
import { getIdPrismaWhereClause } from "./utils"

/**
 * Retrieves a user based on the id provided in the event.
 */
export async function getUserByEvent(event: Event) {
  const user = await prisma.user.findUnique({ where: getIdPrismaWhereClause(event) })

  // Check that user exists
  if (!user) {
    throw createError({ status: 404, message: "User not found" })
  }

  return user
}
