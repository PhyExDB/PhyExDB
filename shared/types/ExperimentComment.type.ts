import { z } from "zod"

/**
 * Type for an ExperimentComment
 */
export interface ExperimentComment extends BaseList{
  /** Text */
  text: string
  /** User who wrote the comment */
  user: {
    id: string,
    name: string,
  }
}

/**
 * Schema for an ExperimentRating
 */
export const experimentCommentCreateSchema = z.object({
  text: z.string({ message: "Bitte geben Sie einen Kommentar ein." }).trim().nonempty("Bitte geben Sie einen Kommentar ein."),
})
