import type { ExperimentList } from "./Experiment.type"

/**
 * Represents a full report of an experiment.
 */
export interface Report extends ReportItem {
  userId: string
  experimentId: string
  seenByOwner: boolean
}

/**
 * Minimal data required to display a report notification.
 */
export interface ReportItem {
  id: string
  message: string
  createdAt: string | Date
}

/**
 * Report with included experiment info.
 */
export interface ReportWithExperiment extends Report {
  experiment: ExperimentList
}
