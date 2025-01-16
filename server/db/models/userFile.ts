import { fileResultExtensions } from "./file"
import type { UserList, UserFileDetail } from "~~/shared/types"

type FileType = Parameters<typeof fileResultExtensions.toDetail.compute>[0]

/**
 * Extensions for transforming user file results.
 */
export const userFileResultExtensions = {
  /**
   * Extension for transforming an user file to a detailed format.
   */
  toDetail: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: {
      id: true,
    },
    /**
     * Computes the detailed format of an user file.
     *
     * @param userFile - The user file object.
     * @returns A function that returns the transformed user file.
     */
    compute(userFile: {
      id: string
    }) {
      return (file: FileType, createdBy: UserList) => {
        return {
          id: userFile.id,
          file: fileResultExtensions.toDetail.compute(file)(createdBy),
        } satisfies UserFileDetail
      }
    },
  },
}
