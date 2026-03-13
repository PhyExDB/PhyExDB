import type { Prisma } from "@prisma/client"
/**
 * Reusable includes
 */
export const experimentSignsInclude = {
  select: {
    id: true,
    name: true,
    type: true,
    iconPath: true,
  },
} satisfies Prisma.ExperimentInclude["signs"]

export const experimentAttributesInclude = {
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
    order: true,
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
} satisfies Prisma.ExperimentInclude["attributes"]

/**
 * Configuration object for selecting specific attributes and their nested properties
 * in an experiment list query.
 */
export const experimentIncludeForToList = {
  previewImage: true,
  attributes: experimentAttributesInclude,
  revisionOf: true,
  revisedBy: true,
  signs: experimentSignsInclude,
  Report: {
    where: {
      seenByOwner: false,
    },
  },
} satisfies Prisma.ExperimentInclude

/**
 * Configuration object for selecting specific attributes and their nested properties
 * in an experiment detail query.
 */
export const experimentIncludeForToDetail = {
  ...experimentIncludeForToList,
  revisionOf: {
    include: {
      Report: {
        where: {
          seenByOwner: false,
        },
      },
    },
  },
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
  reviews: {
    select: {
      reviewerId: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.ExperimentInclude

/**
 * Prisma payload types
 */
export type ExperimentListPrismaPayload =
  Prisma.ExperimentGetPayload<{
    include: typeof experimentIncludeForToList
  }>

export type ExperimentDetailPrismaPayload =
  Prisma.ExperimentGetPayload<{
    include: typeof experimentIncludeForToDetail
  }>

/**
 * Maps the attributes of an experiment to conform to the experiment detail type.
 */
export function mapExperimentToList(
  experiment: ExperimentListPrismaPayload): ExperimentList {
  const attributes = experiment.attributes
    .map(({ attribute, ...value }) => ({
      ...attribute,
      values: [value],
    }))
    .reduce((acc, attribute) => {
      const existing = acc.find(a => a.id === attribute.id)
      if (existing) existing.values.push(...attribute.values)
      else acc.push(attribute)
      return acc
    }, [] as ExperimentAttributeDetail[])

  return {
    ...experiment,
    attributes,
    completedReviewsCount: 0,
    previewImage: experiment.previewImage ?? undefined,
    revisionOf: experiment.revisionOf ?? undefined,
    revisedBy: experiment.revisedBy ?? undefined,
    openReportsCount: experiment.Report?.length ?? 0,
  }
}

/**
 * Maps the attributes of an experiment to conform to the experiment detail type.
 */
export function mapExperimentToDetail(
  experiment: ExperimentDetailPrismaPayload): ExperimentDetail {
  const listMapped = mapExperimentToList(experiment)

  return {
    ...experiment,
    ...listMapped,
    previewImage: experiment.previewImage ?? undefined,

    sections: experiment.sections.map(section => ({
      id: section.id,
      text: section.text,
      experimentSection: section.experimentSection,
      files: section.files.map(file => ({
        id: file.id,
        order: file.order,
        description: file.description ?? undefined,
        file: file.file,
      })),
    })),
    reviews: [],
    alreadyReviewedByMe: false,
    changeRequest: experiment.changeRequest ?? undefined,
    openReports: [
      ...(experiment.Report?.map(report => ({
        message: report.message,
        createdAt: report.createdAt,
      })) ?? []),
      ...(experiment.revisionOf?.Report?.map(report => ({
        message: report.message,
        createdAt: report.createdAt,
      })) ?? []),
    ],
  }
}
