import type { FileList } from "~~/shared/types/File.type"

/**
 * Represents a list of content for an experiment section.
 * Extends the BaseList interface.
 */
export interface ExperimentSectionContentList extends BaseList {
  /**
   * The text content of the experiment section.
   */
  text: string
  /**
   * The list of files associated with the experiment section.
   */
  files: FileList[]
}
