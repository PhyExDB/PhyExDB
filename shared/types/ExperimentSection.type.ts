import type { SlugList } from "./Base.type"

/**
 * Represents a list type of experiment sections with their ids, slugs, names, and orders.
 */
export interface ExperimentSectionList extends SlugList {
  /**
   * The name of the experiment section.
   */
  name: string
  /**
   * The order of the experiment section.
   */
  order: number
}
