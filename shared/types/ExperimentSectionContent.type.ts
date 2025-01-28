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
  files: ExperimentFileDetail[]
}

/**
 * Represents a detail object of an experiment section content.
 */
export interface ExperimentSectionContentDetail extends ExperimentSectionContentList {
  /**
   * The section of the experiment section content.
   */
  experimentSection: ExperimentSectionList
}
