import { validate as uuidValidate } from "uuid"
import type { H3Event, EventHandlerRequest } from "h3"

/**
 * Consumes a value of type T without performing any operations.
 * This is a no-op function that essentially ignores its input.
 *
 * @param _ - The value to consume.
 */
export function consume<T>(_: T) {
  // empty
}

/**
 * Generates a Prisma where clause based on a slug or ID parameter from the event.
 */
export function getSlugOrIdPrismaWhereClause(event: H3Event<EventHandlerRequest>) {
  const slugOrId = getRouterParam(event, "slug")
  if (!slugOrId) {
    throw createError({ status: 400, message: "Invalid slug" })
  }

  const isId = uuidValidate(slugOrId)
  const whereClause = isId ? { id: slugOrId } : { slug: slugOrId }
  return whereClause
}

export function getIdPrismaWhereClause(event: H3Event<EventHandlerRequest>) {
  const id = getRouterParam(event, "slug")
  if (!id) {
    throw createError({ status: 400, message: "Invalid slug" })
  }

  const whereClause = { id: id }
  return whereClause
}
