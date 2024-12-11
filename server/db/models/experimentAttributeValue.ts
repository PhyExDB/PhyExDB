export const experimentAttributeValueResultExtensions = {
  toList: {
    needs: { id: true, name: true },
    compute(value: { id: string, name: string }) {
      return () => {
        return {
          id: value.id,
          name: value.name,
        }
      }
    },
  },
  toDetail: {
    needs: { id: true, name: true },
    compute(value: { id: string, name: string }) {
      return () => {
        return {
          id: value.id,
          name: value.name,
        }
      }
    },
  },
}
