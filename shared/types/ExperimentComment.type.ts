import { z } from "zod"
import type { BaseList } from "./Base.type"

/**
 * Type for an ExperimentComment
 */
export interface ExperimentComment extends BaseList {
  /** Text */
  text: string
  /** User who wrote the comment */
  user: {
    id: string
    name: string
  }
  parentId?: string | null
  children?: ExperimentComment[]
}

/**
 * Type for an en-/disabling comments
 */
export interface ExperimentCommentEnabled {
  /** enabled */
  enable: boolean
}

/**
 * Schema for an ExperimentComment
 */
export const experimentCommentCreateSchema = z.object({
  text: z
    .string({ message: "Bitte geben Sie einen Kommentar ein." })
    .trim().nonempty("Bitte geben Sie einen Kommentar ein."),
  parentId: z.string().uuid().optional(),
})

/**
 * Schema for an ExperimentCommentEnabled
 */
export const experimentCommentEnabledSchema = z.object({
  enable: z.boolean(),
})
