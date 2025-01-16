import type { FileDetail, FileList } from "~~/shared/types"

/**
 * Represents the list of a file.
 */
export type FileListType = { id: string, path: string, mimeType: string }
/**
 * Represents the details of a file.
 */
export type FileDetailType = { id: string, path: string, mimeType: string }

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
    compute(file: FileListType) {
      return () => {
        return file satisfies FileList
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
    compute(file: FileDetailType) {
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
