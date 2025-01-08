import type { ExperimentAttributeValue, ExperimentSectionContent } from "@prisma/client"
import { z } from "zod"

/**
 * ExperimentDetail
 */
export interface ExperimentList extends BaseList {
  name: string
  slug: string
  userId: string
  status: string
}

export interface ExperimentDetail extends ExperimentList {
  attributes: ExperimentAttributeValue[]
  sections: ExperimentSectionContent[]
}

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
