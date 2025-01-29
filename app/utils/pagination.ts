/**
 * The default page number to use when no page is specified in the request.
 */
export const defaultPage = 1

/**
 * The default page size to use when no page size is specified in the request.
 */
export const defaultPageSize = 12

/**
 * Retrieves the pagination metadata from the current route.
 */
export function getRequestPageMeta() {
  const route = useRoute()
  return {
    page: ref(parseInt(route.query.page as string, 10) || defaultPage),
    pageSize: ref(parseInt(route.query.pageSize as string, 10) || defaultPageSize),
  }
}
