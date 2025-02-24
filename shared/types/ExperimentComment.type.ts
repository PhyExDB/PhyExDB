import { z } from "zod"

/**
 * Type for an ExperimentComment
 */
export interface ExperimentComment {
  /** Text */
  text: string
  /** User who wrote the comment */
  userId: string
}

/**
 * Schema for an ExperimentRating
 */
export const experimentCommentCreateSchema = z.object({
  text: z.string({ message: "Bitte geben Sie einen Kommentar ein." }).trim().nonempty("Bitte geben Sie einen Kommentar ein."),
})
