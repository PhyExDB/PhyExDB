/**
 * An object containing methods to transform experiment attribute results into different formats.
 */
export const experimentAttributeResultExtensions = {
  /**
   * Configuration for transforming an experiment attribute to a list format.
   */
  toList: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: { id: true, name: true, slug: true },

    /**
     * Computes the transformation of an experiment attribute to a list format.
     *
     * @param attribute - The experiment attribute to transform.
     * @returns A function that returns the transformed attribute.
     */
    compute(attribute: { id: string, name: string, slug: string }) {
      return () => {
        return {
          id: attribute.id,
          name: attribute.name,
          slug: attribute.slug,
        }
      }
    },
  },

  /**
   * Configuration for transforming an experiment attribute to a detailed format.
   */
  toDetail: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: { id: true, name: true, slug: true },

    /**
     * Computes the transformation of an experiment attribute to a detailed format.
     *
     * @param attribute - The experiment attribute to transform.
     * @returns A function that takes a list of experiment attribute values and returns the transformed attribute.
     */
    compute(attribute: { id: string, name: string, slug: string }) {
      return (values: ExperimentAttributeValueList[]) => {
        return {
          id: attribute.id,
          name: attribute.name,
          slug: attribute.slug,
          values: values,
        }
      }
    },
  },
}
