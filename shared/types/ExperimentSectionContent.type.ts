/**
 * Represents a list of content for an experiment section.
 * Extends the BaseList interface.
 */
export interface ExperimentSectionContentList extends BaseList {
  /**
   * The position of this experiment section within the entire experiment description made up of multiple experiment sections.
   */
  order: number
  /**
   * The text content of the experiment section.
   */
  text: string
  /**
   * The list of files associated with the experiment section.
   */
  files: FileList[]
}
