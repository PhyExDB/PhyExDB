import Experiment from "~~/server/database/models/Experiment"

export default defineEventHandler(async () => {
  const experiments = await Experiment.findAll()

  return experiments.map(experiment => experiment.toExperimentList())
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of experiments",
    tags: ["Experiment"],
    responses: {
      200: {
        description: "A list of experiments",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
})
