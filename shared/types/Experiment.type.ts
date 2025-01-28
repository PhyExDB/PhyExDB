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
   * The duration the execution of the experiment takes in minutes.
   */
  duration: number
  /**
   * The attributes associated with the experiment.
   */
  attributes: ExperimentAttributeValueDetail[]
  /**
   * The preview image of the experiment.
   */
  previewImage?: FileList
}

/**
 * ExperimentDetail
 */
export interface ExperimentDetail extends ExperimentList {
  /**
   * The sections of the experiment.
   */
  sections: ExperimentSectionContentDetail[]
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
export function getExperimentSchema(
  sections: ExperimentSectionList[],
  attributes: ExperimentAttributeDetail[],
) {
  const attributeValueSets = attributes.map((attribute) => {
    const attributeValues = attribute.values.map(attributeValue => attributeValue.id)
    return new Set(attributeValues)
  })
  const requiredNumAttributes = attributes.length
  const requiredNumSections = sections.length

  const experimentSchema = z.object({
    name: z.string(),
    duration: z.array(z.number()).length(1),
    previewImageId: z.string().uuid().optional(),

    sections: z.array(z.object({
      experimentSectionContentId: z.string().uuid().optional(),
      text: z.string(),
      files: z.array(z.object({
        fileId: z.string().uuid(),
        description: z.string().optional(),
      })),
    })).refine((sections) => {
      const sectionIds = sections.map(section => section.experimentSectionContentId)
      return new Set(sectionIds).size === sectionIds.length
    }, {
      message: "Sections must be unique",
    }).refine((sections) => {
      return sections.length === requiredNumSections
    }, {
      message: "Not enough sections defined",
    }),

    attributes: z.array(z.object({
      valueId: z.string().uuid().optional(),
    })).refine(async (attributes) => {
      const attributesContained = new Set()
      attributes.forEach((attribute) => {
        if (!attribute.valueId) {
          return
        }
        for (let i = 0; i < attributeValueSets.length; i++) {
          if (attributeValueSets[i]?.has(attribute.valueId)) {
            attributesContained.add(i)
          }
        }
      })
      return attributesContained.size <= requiredNumAttributes
    }, {
      message: "Too many attributes specified",
    }),
  })
  return experimentSchema
}

/**
 * Transforms an experiment object to the schema type.
 * @param experiment The experiment to transform
 * @param attributes All attributes available
 * @returns The experiment transformed to the schema type
 */
export function transformExperimentToSchemaType(
  experiment: ExperimentDetail,
  attributes: ExperimentAttributeDetail[],
) {
  return {
    name: experiment.name,
    duration: [experiment.duration],
    previewImageId: experiment.previewImage?.id,
    sections: experiment.sections.map(section => ({
      experimentSectionContentId: section.id,
      text: section.text,
      files: section.files.map(file => ({
        fileId: file.file.id,
        description: file.description ?? undefined,
      })),
    })),
    attributes: attributes.map(attribute => ({
      valueId: experiment.attributes.find(experimentAttribute => experimentAttribute.attribute.id === attribute.id)?.id,
    })),
  }
}

/**
 * Checks if the experiment is ready for review.
 * @param sections All sections available
 * @param attributes All attributes available
 * @returns A schema for validating the experiment data
 */
export function getExperimentReadyForReviewSchema(
  sections: ExperimentSectionList[],
  attributes: ExperimentAttributeDetail[],
) {
  const attributeValueSets = attributes.map((attribute) => {
    const attributeValues = attribute.values.map(attributeValue => attributeValue.id)
    return new Set(attributeValues)
  })
  const requiredNumAttributes = attributes.length
  const requiredNumSections = sections.length

  const experimentSchema = z.object({
    name: z.string().trim().nonempty("Name wird benötigt"),
    duration: z.array(z.number()).length(1),
    previewImageId: z.string({ message: "Vorschaubild wird benötigt" }).uuid("Vorschaubild wird benötigt"),

    sections: z.array(z.object({
      experimentSectionContentId: z.string().uuid(),
      text: z.string().trim()
        .nonempty("Beschreibung wird benötigt")
        .regex(/^(?!<p><\/p>$).*/, "Beschreibung wird benötigt"),
      files: z.array(z.object({
        fileId: z.string().uuid(),
        description: z.string().optional(),
      })),
    })).refine((sections) => {
      const sectionIds = sections.map(section => section.experimentSectionContentId)
      return new Set(sectionIds).size === sectionIds.length
    }, {
      message: "Sections must be unique",
    }).refine((sections) => {
      return sections.length === requiredNumSections
    }, {
      message: "Not enough sections defined",
    }),

    attributes: z.array(z.object({
      valueId: z.string({ message: "Attribut wird benötigt" }).uuid("Attribut wird benötigt"),
    })).refine(async (attributes) => {
      const attributesContained = new Set()
      attributes.forEach((attribute) => {
        if (!attribute.valueId) {
          return
        }
        for (let i = 0; i < attributeValueSets.length; i++) {
          if (attributeValueSets[i]?.has(attribute.valueId)) {
            attributesContained.add(i)
          }
        }
      })
      return attributesContained.size === requiredNumAttributes
    }, {
      message: "Not all attributes specified",
    }),
  })
  return experimentSchema
}
