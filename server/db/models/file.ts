import type { FileDetail, FileList } from "~~/shared/types"

/**
 * Represents the list of a file.
 */
export type FileListType = Parameters<typeof fileResultExtensions.toList.compute>[0]
/**
 * Represents the details of a file.
 */
export type FileDetailType = Parameters<typeof fileResultExtensions.toDetail.compute>[0]

/**
 * Extensions for transforming file results.
 */
export const fileResultExtensions = {
  /**
   * Extension for transforming a file to a detailed format.
   */
  toList: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: {
      id: true,
      path: true,
      mimeType: true,
    },
    /**
     * Computes the detailed format of a file.
     *
     * @param file - The file object.
     * @returns A function that returns the transformed file.
     */
    compute(file: { id: string, path: string, mimeType: string }) {
      return () => {
        return {
          id: file.id,
          path: file.path,
          mimeType: file.mimeType,
        } satisfies FileList
      }
    },
  },
  /**
   * Extension for transforming a file to a detailed format.
   */
  toDetail: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: {
      id: true,
      path: true,
      mimeType: true,
    },
    /**
     * Computes the detailed format of a file.
     *
     * @param file - The file object.
     * @returns A function that returns the transformed file.
     */
    compute(file: { id: string, path: string, mimeType: string }) {
      return (createdBy: UserList) => {
        return {
          id: file.id,
          path: file.path,
          mimeType: file.mimeType,
          createdBy: createdBy,
        } satisfies FileDetail
      }
    },
  },
}
