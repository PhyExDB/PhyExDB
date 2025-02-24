import { z } from "zod"

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
})

/**
 * Schema for an ExperimentCommentEnabled
 */
export const experimentCommentEnabledSchema = z.object({
  enable: z.boolean(),
})
