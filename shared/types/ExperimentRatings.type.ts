import { z } from "zod"

/**
 * Type for an ExperimentRating
 */
export interface ExperimentRating {
  value: number
}

/**
 * Schema for an ExperimentRating
 */
export const experimentRatingSchema = z.object({
  value: z.number().min(1).max(5),
})
