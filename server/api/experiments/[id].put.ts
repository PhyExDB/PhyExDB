import { readValidatedBody } from "h3"

export default defineEventHandler(async (event) => {
  /*
  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ status: 400, message: "invalid id" })
  }

  const experiment = await Experiments.findOne({
    where: { id: id },
  })

  if (!experiment) {
    throw createError({ status: 404, message: "Attribute not found" })
  }

  const experimentSchema = v.object({
    title: v.pipe(v.string(), v.nonEmpty("Please enter a title")),
    experimentStatus: v.pipe(v.string()),
    duration: v.pipe(v.number(), v.minValue(1, "The Duration must at least be one minute")),
  })

  const updateExperimentContent = await readValidatedBody(event, body => v.parse(experimentSchema, body))

  return (await experiment.update(updateExperimentContent)).toExperimentDetail*/
})

defineRouteMeta({
  openAPI: {
    description: "Updates an experiment",
    tags: ["Experiment"],
    requestBody: {
      description: "Experiment data",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              experimentStatus: { type: "string", enum: ["Draft", "Submitted", "Accepted"] },
              duration: { type: "number" },
            },
            required: ["username", "email"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Experiment updated sucessfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                createdBy: { type: "string", format: "uuid" },
                title: { type: "string" },
                experimentStatus: { type: "string", enum: ["Draft", "Submitted", "Accepted"] },
                duration: { type: "number" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid user data",
      },
      404: {
        description: "Experiment not found",
      },
    },
  },
})
