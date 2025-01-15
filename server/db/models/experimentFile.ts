import { fileResultExtensions } from "./file"
import type { UserList, ExperimentFileDetail } from "~~/shared/types"

type FileType = Parameters<typeof fileResultExtensions.toDetail.compute>[0]

/**
 * Extensions for transforming experiment file results.
 */
export const experimentFileResultExtensions = {
  /**
   * Extension for transforming an experiment file to a detailed format.
   */
  toDetail: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: {
      id: true,
      description: true,
    },
    /**
     * Computes the detailed format of an experiment file.
     *
     * @param experimentFile - The experiment file object.
     * @returns A function that returns the transformed experiment file.
     */
    compute(experimentFile: {
      id: string
      description: string
    }) {
      return (file: FileType, createdBy: UserList) => {
        return {
          id: experimentFile.id,
          description: experimentFile.description,
          file: fileResultExtensions.toDetail.compute(file)(createdBy),
        } satisfies ExperimentFileDetail
      }
    },
  },
}
