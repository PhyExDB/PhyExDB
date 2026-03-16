import type { ModeratorTask, ReviewSummary } from "#shared/types/Review.type"

/**
 * Checks if a review is up to date with the experiment.
 * A review is up to date if it was completed AFTER or AT the same time the experiment was last updated.
 *
 * @param expUpdateTime The update time of the experiment.
 * @param reviewUpdateTime The update time of the review.
 * @returns True if the review is up to date, false otherwise.
 */
export function isReviewUpToDate(
  expUpdateTime: string | Date,
  reviewUpdateTime: string | Date,
): boolean {
  return new Date(reviewUpdateTime).getTime() >= new Date(expUpdateTime).getTime()
}

/**
 * Filters and counts completed reviews that are up to date for the current round of an experiment.
 *
 * @param expUpdateTime The update time of the experiment.
 * @param reviews The list of reviews for the experiment.
 * @returns An array of up-to-date completed reviews.
 */
export function getUpToDateCompletedReviews<T extends ReviewSummary & { status: string }>(
  expUpdateTime: string | Date,
  reviews: T[],
): T[] {
  return reviews.filter(
    r => r.status === "COMPLETED" && isReviewUpToDate(expUpdateTime, r.updatedAt),
  )
}

/**
 * Checks if a user has already participated in the current review round.
 *
 * @param userId The ID of the user.
 * @param expUpdateTime The update time of the experiment.
 * @param reviews The list of reviews for the experiment.
 * @returns True if the user has already participated, false otherwise.
 */
export function hasUserReviewedCurrentRound(
  userId: string,
  expUpdateTime: string | Date,
  reviews: (ReviewSummary & { status: string })[],
): boolean {
  return getUpToDateCompletedReviews(expUpdateTime, reviews).some(
    r => r.reviewerId === userId,
  )
}

/**
 * Filters moderator tasks that still need attention (i.e., not reviewed in the current round).
 *
 * @param userId The ID of the moderator.
 * @param tasks The list of experiments with their reviews.
 * @returns The filtered list of moderator tasks.
 */
export function filterPendingModeratorTasks<T extends ModeratorTask>(
  userId: string,
  tasks: T[],
): T[] {
  return tasks.filter((task) => {
    const myReview = task.reviews.find(r => r.reviewerId === userId)

    if (!myReview || myReview.status !== "COMPLETED") {
      return true
    }

    return !isReviewUpToDate(task.updatedAt, myReview.updatedAt)
  })
}
