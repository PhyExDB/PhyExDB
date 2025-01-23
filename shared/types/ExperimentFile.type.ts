import { z } from "zod"
import type { FileDetail, FileList } from "./File.type"

/**
 * The ExperimentFile model.
 */
export interface ExperimentFileList extends BaseList {
  /**
   * The description of the file.
   */
  description: string | null
  /**
   * The position of the file.
   */
  order: number
  /**
   * The file itself.
   */
  file: FileList
}
/**
 * The ExperimentFile model.
 */
export interface ExperimentFileDetail extends ExperimentFileList {
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
