import { z } from "zod"

/**
 * The UserFile model.
 */
export interface UserFileDetail {
  /**
   * The unique identifier of the file.
   */
  id: string
  /**
   * The file itself.
   */
  file: FileDetail
  /**
   * The user.
   */
  userId: string
}

/**
 * Schema for creating a UserFile.
 */
export const userFileCreateSchema = z.object({
  fileId: z.string().uuid(),
})
