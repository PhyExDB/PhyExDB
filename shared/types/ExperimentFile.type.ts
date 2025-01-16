import { z } from "zod"
import type { FileDetail, FileList } from "./File.type"

/**
 * The ExperimentFile model.
 */
export interface ExperimentFileList {
  /**
   * The unique identifier of the file.
   */
  id: string
  /**
   * The description of the file.
   */
  description: string | null
  /**
   * The file itself.
   */
  file: FileList
}
/**
 * The ExperimentFile model.
 */
export interface ExperimentFileDetail {
  /**
   * The unique identifier of the file.
   */
  id: string
  /**
   * The description of the file.
   */
  description: string | null
  /**
   * The file itself.
   */
  file: FileDetail
}

/**
 * Schema for creating an ExperimentFile.
 */
export const experimentFileCreateSchema = z.object({
  description: z.string({ required_error: "Beschreibung muss angegeben werden" }),
  fileId: z.string().uuid(),
  experimentSectionId: z.string().uuid(),
})

/**
 * Schema for updating an ExperimentFile.
 */
export const experimentFileUpdateSchema = z.object({
  description: z.string({ required_error: "Beschreibung muss angegeben werden" }),
})
