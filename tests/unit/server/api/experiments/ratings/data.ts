import { v4 as uuidv4 } from "uuid"
import type { ExperimentList } from "#shared/types"
import type { ExperimentRating } from "#shared/types/ExperimentRatings.type"

/**
 * Experiement
 */
export const experiment = {
  id: uuidv4(),
  slug: "slug",
  ratingsSum: 0,
  ratingsCount: 0,
} as unknown as ExperimentList

/**
 * Rating
 */
export const rating = {
  value: 2,
} as ExperimentRating
