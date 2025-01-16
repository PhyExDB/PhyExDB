import { experimentAttributeValueResultExtensions } from "./experimentAttributeValue"
import { experimentSectionContentResultExtensions } from "./experimentSectionContent"
import type { SectionsListType } from "./experimentSectionContent"

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
      status: true,
      duration: true,
    },

    /**
     * Computes the transformation of an experiment to a list format.
     *
     * @param experiment - The experiment to transform.
     * @returns A function that returns the transformed experiment.
     */
    compute(experiment: { id: string, name: string, slug: string, userId: string, status: string, duration: number }) {
      return (attributes: Parameters<typeof experimentAttributeValueResultExtensions.toList.compute>[0][]) => {
        return {
          id: experiment.id,
          name: experiment.name,
          slug: experiment.slug,
          userId: experiment.userId,
          status: experiment.status,
          duration: experiment.duration,
          attributes: attributes.map(value => experimentAttributeValueResultExtensions.toList.compute(value)()),
        } satisfies ExperimentList
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
      userId: true,
      status: true,
      duration: true,
    },

    /**
     * Computes the transformation of an experiment to a detailed format.
     *
     * @param experiment - The experiment to transform.
     * @returns A function that returns the transformed experiment.
     */
    compute(experiment: { id: string, name: string, slug: string, userId: string, status: string, duration: number }) {
      return async (
        attributes: Parameters<typeof experimentAttributeValueResultExtensions.toList.compute>[0][],
        sections: SectionsListType[],
      ) => {
        return {
          id: experiment.id,
          name: experiment.name,
          slug: experiment.slug,
          userId: experiment.userId,
          status: experiment.status,
          duration: experiment.duration,
          attributes: attributes.map(value => experimentAttributeValueResultExtensions.toList.compute(value)()),
          sections: sections.map(value => experimentSectionContentResultExtensions.toList.compute(value)(value.files)),
        } satisfies ExperimentDetail
      }
    },
  },
}
