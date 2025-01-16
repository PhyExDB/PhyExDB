/**
 * Configuration object for selecting specific attributes and their nested properties
 * in an experiment list query.
 */
export const experimentIncludeForToList = {
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
    select: {
      id: true,
      text: true,
      files: {
        select: {
          id: true,
          description: true,
          file: {
            select: {
              id: true,
              mimeType: true,
              path: true,
            },
          },
        },
      },
    },
  },
}
