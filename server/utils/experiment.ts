import type { Prisma } from "@prisma/client"

/**
 * Configuration object for selecting specific attributes and their nested properties
 * in an experiment list query.
 */
export const experimentIncludeForToList = {
  previewImage: true,
  attributes: {
    select: {
      id: true,
      slug: true,
      value: true,
      attribute: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  },
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
