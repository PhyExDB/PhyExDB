import type { File } from "@prisma/client"

/**
 * Represents a list of content for an experiment section.
 * Extends the BaseList interface.
 */
export interface ExperimentSectionContentList extends BaseList {
  /**
   * The order of the content in the list.
   */
  order: number
  /**
   * The text content of the experiment section.
   */
  text: string
  /**
   * The list of files associated with the experiment section.
   */
  files: File[]
}
