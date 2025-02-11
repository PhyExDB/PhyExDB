import type { Prisma } from "@prisma/client"

/**
 * Configuration object for selecting specific attributes and their nested properties
 * in an experiment list query.
 */
export const experimentIncludeForToList = {
  previewImage: true,
  attributes: {
    orderBy: [
      {
        attribute: {
          order: "asc" as Prisma.SortOrder,
        },
      },
      {
        value: "asc" as Prisma.SortOrder,
      },
    ],
    select: {
      id: true,
      slug: true,
      value: true,
      attribute: {
        select: {
          id: true,
          slug: true,
          name: true,
          order: true,
          multipleSelection: true,
        },
      },
    },
  },
  revisionOf: true,
  revisedBy: true,
}

/**
 * Configuration object for selecting specific attributes and their nested properties
 * in an experiment detail query.
 */
export const experimentIncludeForToDetail = {
  ...experimentIncludeForToList,
  sections: {
    orderBy: {
      experimentSection: {
        order: "asc" as Prisma.SortOrder,
      },
    },
    select: {
      id: true,
      text: true,
      files: {
        orderBy: {
          order: "asc" as Prisma.SortOrder,
        },
        select: {
          id: true,
          description: true,
          order: true,
          file: {
            select: {
              id: true,
              mimeType: true,
              path: true,
              originalName: true,
            },
          },
        },
      },
      experimentSection: {
        select: {
          id: true,
          name: true,
          slug: true,
          order: true,
        },
      },
    },
  },
}

/**
 * Maps the attributes of an experiment to conform to the experiment detail type.
 */
export function mapExperimentToList(experiment: ExperimentIncorrectList): ExperimentList {
  const experimentAttributes = experiment.attributes.map((attributeValue) => {
    const { attribute, ...value } = attributeValue
    return {
      ...attribute,
      values: [value],
    }
  }).reduce((acc, attribute) => {
    const existingAttribute = acc.find(a => a.id === attribute.id)
    if (existingAttribute) {
      existingAttribute.values.push(...attribute.values)
    } else {
      acc.push(attribute)
    }
    return acc
  }, [] as ExperimentAttributeDetail[])

  return {
    ...experiment,
    attributes: experimentAttributes,
  } as ExperimentDetail
}

/**
 * Maps the attributes of an experiment to conform to the experiment detail type.
 */
export function mapExperimentToDetail(experiment: ExperimentIncorrectDetail): ExperimentDetail {
  const listObject = mapExperimentToList(experiment)
  return {
    ...experiment,
    ...listObject,
  } as ExperimentDetail
}
