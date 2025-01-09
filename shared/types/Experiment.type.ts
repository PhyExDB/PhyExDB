import type { ExperimentAttributeValue, ExperimentSectionContent } from "@prisma/client"
import { z } from "zod"

/**
 * ExperimentList
 */
export interface ExperimentList extends BaseList {
  /**
   * The name of the experiment.
   */
  name: string
  /**
   * The slug of the experiment.
   */
  slug: string
  /**
   * The creator of the experiment.
   */
  userId: string
  /**
   * The status of the experiment.
   */
  status: string
}

/**
 * ExperimentDetail
 */
export interface ExperimentDetail extends ExperimentList {
  /**
   * The attributes associated with the experiment.
   */
  attributes: ExperimentAttributeValue[]
  /**
   * The sections of the experiment.
   */
  sections: ExperimentSectionContent[]
}

/**
 * Asynchronously retrieves the experiment schema.
 *
 * The schema includes the following properties:
 * - `name`: A string representing the name of the experiment.
 * - `duration`: A number representing the duration of the experiment.
 * - `sections`: An array of section objects, each containing:
 *   - `experimentSectionPositionInOrder`: A number representing the position of the section in order.
 *   - `text`: A string representing the text of the section.
 *   - `files`: An array of file objects, each containing:
 *     - `fileId`: A string representing the ID of the file.
 * The sections array is validated to ensure:
 * - Each section has a unique `experimentSectionPositionInOrder`.
 * - The number of sections matches the required number of sections.
 * The attributes array is validated to ensure:
 * - The number of attributes matches the required number of attributes.
 * @returns {Promise<z.ZodObject>} A promise that resolves to the experiment schema.
 */
export async function getExperimentSchema() {
  const requiredNumSections = await prisma.experimentSection.count()
  const requiredNumAttributes = await prisma.experimentAttribute.count()

  const experimentSchema = z.object({
    name: z.string(),
    duration: z.number(),

    sections: z.array(z.object({
      experimentSectionPositionInOrder: z.number(),
      text: z.string(),
      files: z.array(z.object({
        fileId: z.string(),
      })),
    })).refine((sections) => {
      const sectionIds = sections.map(section => section.experimentSectionPositionInOrder)
      return new Set(sectionIds).size == sectionIds.length
    }, {
      message: "Sections must be unique",
    }).refine((sections) => {
      return sections.length == requiredNumSections
    }, {
      message: "Not enough sections defined",
    }),

    attributes: z.array(z.object({
      valueId: z.string(),
    })).refine(async (attributes) => {
      const attributeIds = await Promise.all(
        attributes.map(async (attribute) => {
          const attributeValue = await prisma.experimentAttributeValue.findFirst({
            where: {
              id: attribute.valueId,
            },
          })
          return attributeValue!.id
        }),
      )
      return attributeIds.length == requiredNumAttributes
    }, {
      message: "Not enough attributes specified",
    }),
  })
  return experimentSchema
}
