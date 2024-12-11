export const legalDocumentResultExtensions = {
  toList: {
    needs: { id: true, name: true, slug: true },
    compute(legal: { id: string, name: string, slug: string }) {
      return () => {
        return {
          id: legal.id,
          name: legal.name,
          slug: legal.slug,
        }
      }
    },
  },
  toDetail: {
    needs: { id: true, name: true, slug: true, text: true },
    compute(legal: { id: string, name: string, slug: string, text: string }) {
      return () => {
        return {
          id: legal.id,
          name: legal.name,
          slug: legal.slug,
          text: legal.text,
        }
      }
    },
  },
}
