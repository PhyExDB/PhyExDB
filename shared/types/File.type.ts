/**
 * Represents a list of content for an file.
 * Extends the BaseList interface.
 */
export interface FileList extends BaseList {
  /**
   * The mime type of the file.
   */
  mimeType: string
}
