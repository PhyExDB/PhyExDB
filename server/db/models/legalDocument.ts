/**
 * Extensions for transforming legal document results.
 */
export const legalDocumentResultExtensions = {
  /**
   * Extension for transforming a legal document to a list format.
   */
  toList: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: {
      id: true,
      name: true,
      slug: true,
    },
    /**
     * Computes the list format of a legal document.
     *
     * @param legal - The legal document object.
     * @returns A function that returns the transformed legal document.
     */
    compute(legal: { id: string, name: string, slug: string }) {
      return () => {
        return {
          id: legal.id,
          name: legal.name,
          slug: legal.slug,
        } satisfies LegalDocumentList
      }
    },
  },
  /**
   * Extension for transforming a legal document to a detailed format.
   */
  toDetail: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: {
      id: true,
      name: true,
      slug: true,
      text: true,
    },
    /**
     * Computes the detailed format of a legal document.
     *
     * @param legal - The legal document object.
     * @returns A function that returns the transformed legal document.
     */
    compute(legal: { id: string, name: string, slug: string, text: string }) {
      return () => {
        return {
          id: legal.id,
          name: legal.name,
          slug: legal.slug,
          text: legal.text,
        } satisfies LegalDocumentDetail
      }
    },
  },
}
