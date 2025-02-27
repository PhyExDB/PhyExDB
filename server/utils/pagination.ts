import type { Event } from "./utils"

/**
 * Reads page and pageSize query parameters from an event.
 */
export function getPageQuery(event: Event) {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 12

  return {
    page,
    pageSize,
  }
}

/**
 * Generates pagination metadata for a given event and total number of items.
 */
export function getPageMeta(event: Event, total: number): PageMeta {
  const { page, pageSize } = getPageQuery(event)
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
export function getPaginationPrismaParam(meta: Pick<PageMeta, "page" | "pageSize">): { skip: number, take: number } {
  return {
    skip: (meta.page - 1) * meta.pageSize,
    take: meta.pageSize,
  }
}
