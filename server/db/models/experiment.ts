import type { ExperimentAttributeValue } from "@prisma/client"

//Für list: id,name,slug,user,values (joined with attributes(name))
//Für detail: id,name,slug,user,values (joined with attributes(name)),sections(text,files,(order aus ExperimentSection))

/**
 * An object containing methods to transform experiment results into different formats.
 */
export const experimentResultExtensions = {
  /**
   * Configuration for transforming an experiment to a list format.
   */
  toList: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: {
      id: true,
      name: true,
      slug: true,
      userId: true,
      attributes: true,
    },

    /**
     * Computes the transformation of an experiment to a list format.
     *
     * @param experiment - The experiment to transform.
     * @returns A function that returns the transformed experiment.
     */
    compute(experiment: { id: string, name: string, slug: string, userId: string, attributes: ExperimentAttributeValue[] }) {
      return () => {
        return {
          id: experiment.id,
          name: experiment.name,
          slug: experiment.slug,
          user: experiment.userId,
          attributes: experiment.attributes,
        }
      }
    },
  },

  /**
   * Configuration for transforming an experiment to a detailed format.
   */
  toDetail: {
    /**
     * Specifies the required fields for the transformation.
     */
    needs: {
      id: true,
      name: true,
      slug: true,
      user: true,
      attributes: true,
    },

    /**
     * Computes the transformation of an experiment to a detailed format.
     *
     * @param experiment - The experiment to transform.
     * @returns A function that returns the transformed experiment.
     */
    compute(experiment: { id: string, name: string, slug: string, user: string, attributes: ExperimentAttributeValue }) {
      return () => {
        return {
          id: experiment.id,
          name: experiment.name,
          slug: experiment.slug,
          user: experiment.user,
          attributes: experiment.attributes,
        }
      }
    },
  },
}
