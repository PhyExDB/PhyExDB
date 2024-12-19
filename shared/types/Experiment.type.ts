import type { ExperimentAttributeValue } from "@prisma/client"

/**
 * ExperimentDetail
 */
export interface ExperimentList extends BaseList {
  name: string
  slug: string
  userId: string
  attributes: ExperimentAttributeValue
}
