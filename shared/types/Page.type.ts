/**
 * Represents a paginated response of items of type `T`.
 */
export interface Page<T> {
  /**
   * The list of items on the current page.
   */
  items: T[]
  /**
   * The pagination details.
   */
  pagination: {
    /**
     * The total number of items.
     */
    total: number
    /**
     * The total number of pages.
     */
    totalPages: number
    /**
     * The current page number.
     */
    page: number
    /**
     * The number of items per page.
     */
    pageSize: number
  }
}
