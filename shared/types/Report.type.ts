/**
 * Represents a report on an experiment.
 */
export interface Report {
  id: string
  message: string
  userId: string
  experimentId: string
  seenByOwner: boolean
  createdAt: string | Date
}

/**
 * ReportDialog with included experiment info.
 */
export interface ReportWithExperiment extends Report {
  experiment: {
    id: string
    name: string
    slug: string
    createdAt: string | Date
    updatedAt: string | Date
    userId: string | null
    status: string
  }
}
