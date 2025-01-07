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

export interface FileDetail {
  id: string
  path: string
  mimeType: string
  createdBy: UserList
}