import { z } from "zod"
import type { FileList } from "./File.type"

/**
 * ExperimentList
 */
export interface ExperimentList extends SlugList {
  /**
   * The name of the experiment.
   */
  name: string
  /**
   * The creator of the experiment.
   */
  userId: string
  /**
   * The status of the experiment.
   */
  status: string
  /**
   * The duration of the experiment
   */
  duration: number
  /**
   * The attributes associated with the experiment.
   */
  attributes: ExperimentAttributeValueList[]
  /**
   * The preview image of the experiment.
   */
  previewImage: FileList
}

/**
 * ExperimentDetail
 */
export interface ExperimentDetail extends ExperimentList {
  /**
   * The sections of the experiment.
   */
  sections: ExperimentSectionContentList[]
}

/**
 * Generates a schema for an experiment using the provided sections and attributes.
 *
 * @param sections - An array of `ExperimentSectionList` objects representing the sections of the experiment.
 * @param attributes - An array of `ExperimentAttributeDetail` objects representing the attributes of the experiment.
 * @returns A Zod schema object for validating the experiment data.
 *
 * The schema includes the following fields:
 * - `name`: A string representing the name of the experiment.
 * - `duration`: A number representing the duration of the experiment.
 * - `previewImageId`: A UUID string representing the ID of the preview image.
 * - `sections`: An array of objects representing the sections of the experiment. Each section object includes:
 *   - `experimentSectionPositionInOrder`: A number representing the position of the section in order.
 *   - `text`: A string representing the text content of the section.
 *   - `files`: An array of objects representing the files associated with the section. Each file object includes:
 *     - `fileId`: A string representing the ID of the file.
 * - `attributes`: An array of objects representing the attributes of the experiment. Each attribute object includes:
 *   - `valueId`: A string representing the ID of the attribute value.
 *
 * The schema also includes the following refinements:
 * - Sections must be unique based on their `experimentSectionPositionInOrder`.
 * - The number of sections must match the required number of sections.
 * - The number of attributes specified must match the required number of attributes.
 */
export function getExperimentSchema(sections: ExperimentSectionList[], attributes: ExperimentAttributeDetail[]) {
  const attributeValueSets = attributes.map((attribute) => {
    const attributeValues = attribute.values.map(attributeValue => attributeValue.id)
    return new Set(attributeValues)
  })
  const requiredNumAttributes = attributes.length

  const requiredNumSections = sections.length

  const experimentSchema = z.object({
    name: z.string(),
    duration: z.number(),
    previewImageId: z.string().uuid(),

    sections: z.array(z.object({
      experimentSectionPositionInOrder: z.number(),
      text: z.string(),
      files: z.array(z.object({
        fileId: z.string(),
      })),
    })).refine((sections) => {
      const sectionIds = sections.map(section => section.experimentSectionPositionInOrder)
      return new Set(sectionIds).size === sectionIds.length
    }, {
      message: "Sections must be unique",
    }).refine((sections) => {
      return sections.length === requiredNumSections
    }, {
      message: "Not enough sections defined",
    }),

    attributes: z.array(z.object({
      valueId: z.string(),
    })).refine(async (attributes) => {
      const attributesContained = new Set()
      attributes.forEach((attribute) => {
        for (let i = 0; i < attributeValueSets.length; i++) {
          if (attributeValueSets[i]?.has(attribute.valueId)) {
            attributesContained.add(i)
          }
        }
      })
      return attributesContained.size === requiredNumAttributes
    }, {
      message: "Not enough attributes specified",
    }),
  })
  return experimentSchema
}
