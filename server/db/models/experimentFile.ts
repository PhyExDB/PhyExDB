import { fileResultExtensions } from "./file"
import type { FileDetailType, FileListType } from "./file"
import type { UserList, ExperimentFileDetail } from "~~/shared/types"

/**
 * Represents the list of a file.
 */
export type ExperimentFileListType = Parameters<typeof experimentFileResultExtensions.toList.compute>[0] & {
  file: FileListType
}
/**
 * Represents the details of a file.
 */
export type ExperimentFileDetailType = Parameters<typeof experimentFileResultExtensions.toDetail.compute>[0] & {
  file: FileDetailType[]
}

/**
 * Extensions for transforming experiment file results.
 */
export const experimentFileResultExtensions = {
  /**
   * Extension for transforming an experiment file to a listed format.
   */
  toList: {
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
      description: string | null
    }) {
      return (file: FileListType) => {
        return {
          id: experimentFile.id,
          description: experimentFile.description,
          file: fileResultExtensions.toList.compute(file)(),
        } satisfies ExperimentFileList
      }
    },
  },

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
      description: string | null
    }) {
      return (file: FileDetailType, createdBy: UserList) => {
        return {
          id: experimentFile.id,
          description: experimentFile.description,
          file: fileResultExtensions.toDetail.compute(file)(createdBy),
        } satisfies ExperimentFileDetail
      }
    },
  },
}
