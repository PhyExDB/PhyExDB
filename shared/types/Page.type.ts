/*
 * Represents a paginated response.
 *
 * @template T - The type of items contained in the page.
 *
 * @property {T[]} items - The list of items on the current page.
 * @property {Object} pagination - The pagination details.
 * @property {number} pagination.total - The total number of items.
 * @property {number} pagination.totalPages - The total number of pages.
 * @property {number} pagination.page - The current page number.
 * @property {number} pagination.pageSize - The number of items per page.
 */
export interface Page<T> {
  items: T[]
  pagination: {
    total: number
    totalPages: number
    page: number
    pageSize: number
  }
}
