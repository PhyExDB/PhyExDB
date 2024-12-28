/**
 * Extensions for transforming file results.
 */
export const fileResultExtensions = {
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
        }
      }
    },
  },
}
