import * as v from "valibot"
import { readValidatedBody } from "h3"
import Users from "~~/server/database/models/User"
import Experiments from "~~/server/database/models/Experiment"

export default defineEventHandler(async (event) => {
  // Get id of verified user
  const user = await Users.findOne() // TODO: get the currently verified user!

  // Validate user data
  const experimentSchema = v.object({
    title: v.pipe(v.string(), v.nonEmpty("Please enter a title")),
    duration: v.pipe(v.number(), v.minValue(1, "The Duration must at least be one minute")),
  })

  // This is a helper function that reads the body and validates it against the schema
  const newExperiment = await readValidatedBody(event, body => v.parse(experimentSchema, body))

  // Create new experiment
  const experiment = await Experiments.create({ createdBy: user, title: newExperiment.title, experimentStatus: "Draft", duration: newExperiment.duration })

  return experiment.toExperimentDetail()
})

defineRouteMeta({
  openAPI: {
    description: "Creates a new experiment",
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
              duration: { type: "number" },
            },
            required: ["title", "duration"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Experiment created successfully",
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
        description: "Invalid experiment data",
      },
    },
  },
})
