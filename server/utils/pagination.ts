import type { H3Event, EventHandlerRequest } from "h3"
import { getQuery } from "h3"

/**
 * Generates pagination metadata for a given event and total number of items.
 */
export function getPageMeta(event: H3Event<EventHandlerRequest>, total: number): PageMeta {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 12
  const totalPages = Math.ceil(total / pageSize)

  return {
    page,
    pageSize,
    totalPages,
    total,
  }
}

/**
 * Generates pagination parameters for Prisma queries.
 */
export function getPaginationPrismaParam(meta: PageMeta): { skip: number, take: number } {
  return {
    skip: (meta.page - 1) * meta.pageSize,
    take: meta.pageSize,
  }
}
