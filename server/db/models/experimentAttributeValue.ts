/**
 * Extensions for experiment attribute value results.
 */
export const experimentAttributeValueResultExtensions = {
  /**
   * Extension to convert experiment attribute value to a list format.
   */
  toList: {
    /**
     * Specifies the required fields for the list format.
     */
    needs: { id: true, name: true },

    /**
     * Computes the list format of the experiment attribute value.
     *
     * @param value - The experiment attribute value containing id and name.
     * @returns A function that returns an object with id and name.
     */
    compute(value: { id: string, name: string }) {
      return () => {
        return {
          id: value.id,
          name: value.name,
        }
      }
    },
  },

  /**
   * Extension to convert experiment attribute value to a detailed format.
   */
  toDetail: {
    /**
     * Specifies the required fields for the detailed format.
     */
    needs: { id: true, name: true },

    /**
     * Computes the detailed format of the experiment attribute value.
     *
     * @param value - The experiment attribute value containing id and name.
     * @returns A function that returns an object with id and name.
     */
    compute(value: { id: string, name: string }) {
      return () => {
        return {
          id: value.id,
          name: value.name,
        }
      }
    },
  },
}
