/**
 * Interface representing a base list item.
 */
export interface BaseList {
  /**
   * The unique identifier for the list item.
   */
  id: string
}

/**
 * Type alias for creating a base list item.
 * This is equivalent to the BaseList interface.
 */
export type BaseCreate = BaseList
