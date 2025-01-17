import type { ExperimentSectionList } from "~~/shared/types/ExperimentSection.type"

export default defineEventHandler(async () => {
  return await prisma.experimentSection.findMany() as ExperimentSectionList[]
})

defineRouteMeta({
  openAPI: {
    description: "Get a List with Experiment Sections",
    tags: ["ExperimentSection"],
    responses: {
      200: {
        description: "A list of Experiment Sections",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  order: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
  },
})
