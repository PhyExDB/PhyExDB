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
 * Interface representing a base list item with a slug.
 */
export interface SlugList extends BaseList {
  /**
   * The humanreadable slug to identify the list item.
   */
  slug: string
}

/**
 * Type alias for creating a base list item.
 * This is equivalent to the BaseList interface.
 */
export type BaseCreate = BaseList
