/**
 * Returns the name of the experiment or a placeholder if the name is not available.
 *
 * @param {ExperimentList} experiment - The experiment object containing the name.
 * @returns {string} The name of the experiment or "Unbenanntes Experiment" if the name is not defined.
 */
export function nameOrPlaceholderForExperiment(experiment: Pick<ExperimentList, "name">): string {
  return experiment.name || "Unbenannter Versuch"
}

/**
 * Returns the badge title corresponding to the given experiment status.
 *
 * @param status - The status of the experiment. Possible values are:
 *   - "DRAFT": The experiment is in draft state.
 *   - "IN_REVIEW": The experiment is under review.
 *   - "PUBLISHED": The experiment has been published.
 *   - "REJECTED": The experiment has been rejected.
 * @returns The badge title in German corresponding to the given status.
 */
export function badgeTitleForExperimentStatus(status: string) {
  switch (status) {
    case "DRAFT":
      return "Entwurf"
    case "IN_REVIEW":
      return "In Überprüfung"
    case "PUBLISHED":
      return "Veröffentlicht"
    case "REJECTED":
      return "Abgelehnt"
    default:
      return "Unbekannt"
  }
}

export function badgeColorClass(status: string) {
  const styles: Record<string, string> = {
    DRAFT: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
    PUBLISHED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
    IN_REVIEW: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  }
  return styles[status] || "bg-muted text-muted-foreground"
}

/**
 * Asynchronously creates a new experiment by sending a POST request to the server.
 *
 * @returns {Promise<void>} A promise that resolves when the experiment is created and navigation is complete.
 */
export async function createExperiment(): Promise<void> {
  const experiment = await $fetch("/api/experiments", {
    method: "POST",
  })
  await navigateTo(`/experiments/edit/${experiment.id}`)
}

/**
 * Deletes an experiment by its ID and navigates to the experiments page.
 * If the user is not authenticated (status 401), navigates to the login page.
 *
 * @param {ExperimentList} experimentID - The ID of the experiment to be deleted.
 * @throws Will throw an error if the deletion fails for any reason other than authentication.
 */
export async function deleteExperiment(experimentId: string) {
  try {
    await $fetch(`/api/experiments/delete/${experimentId}`, {
      method: "DELETE",
    })
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status
    if (status === 401) {
      await navigateTo("/login")
    }
    throw error
  }
}

/**
 * Duplicates an experiment by making an API call to clone the experiment.
 * If the duplication is successful, navigates to the edit page of the duplicated experiment.
 * If an error occurs and the status is 401 or 403, navigates to the login page.
 *
 * @param {ExperimentList} experiment - The experiment to be duplicated.
 * @param {boolean} isRevision - Indicates whether the duplication is a revision.
 */
export async function duplicateExperiment(experiment: ExperimentList, isRevision: boolean) {
  try {
    const duplicate = await $fetch(`/api/experiments/clone/${experiment.id}?revision=${isRevision}`, {
      method: "PUT",
    })
    await navigateTo(`/experiments/edit/${duplicate.id}`)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status
    if (status === 401 || status === 403) {
      await navigateTo("/login")
    }
  }
}
