/**
 * Represents a review of an experiment.
 */
export interface Review {
  id: string
  experimentId: string
  reviewerId: string
  status: "IN_PROGRESS" | "COMPLETED"
  createdAt: string | Date
  updatedAt: string | Date
  sectionsCritiques?: SectionCritique[]
  reviewer?: {
    name: string
    image: string | null
  }
}

/**
 * Represents a specific critique for an experiment section within a review.
 */
export interface SectionCritique {
  id: string
  reviewId: string
  sectionContentId: string
  critique: string
  createdAt: string | Date
  updatedAt: string | Date
  sectionContent?: {
    id: string
    experimentSection: {
      id: string
      name: string
    }
  }
}

export interface ReviewSummary {
  reviewerId: string
  updatedAt: string | Date
}
