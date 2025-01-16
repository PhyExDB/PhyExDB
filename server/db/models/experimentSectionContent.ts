import { fileResultExtensions, type FileListType } from "./file"

/**
 * Represents the list of an section.
 */
export type SectionsListType = Parameters<typeof experimentSectionContentResultExtensions.toList.compute>[0] & {
  files: FileListType[]
}

/**
 * An object containing methods to transform experiment section contents into different formats.
 */
export const experimentSectionContentResultExtensions = {
  toList: {
    /**
    * Specifies the required fields for the list format.
    */
    needs: {
      id: true,
      text: true,
    },

    /**
    * Computes the list format of the experiment section content.
    *
    * @param value - The experiment attribute section content containing id, order and text
    * @returns A function that returns an object with id and name.
    */
    compute(value: { id: string, text: string }) {
      return (files: Parameters<typeof fileResultExtensions.toList.compute>[0][]) => {
        return {
          id: value.id,
          text: value.text,
          files: files.map(file => fileResultExtensions.toList.compute(file)()),
        } satisfies ExperimentSectionContentList
      }
    },
  },
}
