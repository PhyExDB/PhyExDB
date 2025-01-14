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
      return async () => {
        return {
          id: value.id,
          text: value.text,
          order: (await prisma.experimentSectionContent.findFirst({
            where: {
              id: value.id,
            },
            include: {
              experimentSection: true,
            },
          }))!.experimentSection.order,
          files: await prisma.file.findMany({
            where: {
              experimentSectionId: value.id,
            },
          }),
        }
      }
    },
  },
}
