import type { File } from "@prisma/client"

export interface ExperimentSectionContentList extends BaseList {
  order: number
  text: string
  files: File[]
}
