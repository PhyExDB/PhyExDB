import type { FileList } from "~~/shared/types/File.type"

/**
 * An object containing methods to transform file contents into different formats.
 */
export const fileResultExtensions = {
  toList: {
    /**
      * Specifies the required fields for the list format.
      */
    needs: {
      id: true,
      mimeType: true,
    },

    /**
      * Computes the list format of the experiment section content.
      *
      * @param value - The experiment attribute section content containing id, order and text
      * @returns A function that returns an object with id and name.
      */
    compute(value: { id: string, mimeType: string }) {
      return () => {
        return {
          id: value.id,
          mimeType: value.mimeType,
        } satisfies FileList
      }
    },
  },
}
