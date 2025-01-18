/**
 * Represents a file with its metadata.
 */
export interface File {
  /**
   * The name of the file.
   */
  name: string

  /**
   * The content of the file.
   */
  content: string

  /**
   * The size of the file.
   */
  size: string

  /**
   * The MIME type of the file.
   */
  type: string

  /**
   * The last modified date of the file.
   */
  lastModified: string
}

/**
 * Represents the list of a file.
 */
export interface FileList extends BaseList {
  /**
   * The path to the file.
   */
  path: string

  /**
   * The MIME type of the file.
   */
  mimeType: string
}

/**
 * Represents the details of a file.
 */
export interface FileDetail extends FileList {
  /**
   * The user who created the file.
   */
  createdBy: UserList
}
