export const experimentAttributeResultExtensions = {
  toList: {
    needs: { id: true, name: true, slug: true },
    compute(attribute: { id: string, name: string, slug: string }) {
      return () => {
        return {
          id: attribute.id,
          name: attribute.name,
          slug: attribute.slug,
        }
      }
    },
  },
  toDetail: {
    needs: { id: true, name: true, slug: true },
    compute(attribute: { id: string, name: string, slug: string }) {
      return (values: ExperimentAttributeValueList[]) => {
        return {
          id: attribute.id,
          name: attribute.name,
          slug: attribute.slug,
          values: values,
        }
      }
    },
  },
}
