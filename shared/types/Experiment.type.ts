import type { BaseList } from "./Base.type"

export interface ExperimentList extends BaseList {
  title: string
}

export interface ExperimentDetail extends ExperimentList {
  createdBy: string
  title: string
  experimentStatus: string
  duration: number
}
