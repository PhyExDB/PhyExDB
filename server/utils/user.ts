import type { Event } from "./utils"
import { getIdPrismaWhereClause } from "./prisma"

/**
 * Retrieves a user based on the id provided in the event.
 */
export async function getUserByEvent(event: Event) {
  return nullTo404(async () => await prisma.user.findUnique({ where: getIdPrismaWhereClause(event) }))
}
