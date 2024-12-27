import type { ExperimentAttributeValue } from "@prisma/client"
import type { ExperimentSectionContentList } from "~~/shared/types/ExperimentSectionContent.type"

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
    },

    /**
     * Computes the transformation of an experiment to a list format.
     *
     * @param experiment - The experiment to transform.
     * @returns A function that returns the transformed experiment.
     */
    compute(experiment: { id: string, name: string, slug: string, userId: string }) {
      return () => {
        return {
          id: experiment.id,
          name: experiment.name,
          slug: experiment.slug,
          userId: experiment.userId,
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
      sections: true,
    },

    /**
     * Computes the transformation of an experiment to a detailed format.
     *
     * @param experiment - The experiment to transform.
     * @returns A function that returns the transformed experiment.
     */
    compute(experiment: { id: string, name: string, slug: string, user: string, attributes: ExperimentAttributeValue[], sections: ExperimentSectionContentList[] }) {
      return () => {
        return {
          id: experiment.id,
          name: experiment.name,
          slug: experiment.slug,
          user: experiment.user,
          attributes: experiment.attributes,
          sections: experiment.sections,
        }
      }
    },
  },
}
