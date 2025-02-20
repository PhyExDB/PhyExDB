import { z } from "zod"

/**
 * Schema for an ExperimentRating
 */
export const experimentRatingSchema = z.object({
  value: z.number().min(1).max(5),
})
