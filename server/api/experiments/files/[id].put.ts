import { experimentFileCreateSchema } from "~~/shared/types"
import { canUpdateExperimentFile } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const experimentFileId = getRouterParam(event, "id")

  const user = await getUser(event)
  if (!user) {
    throw createError({ status: 401, message: "Unauthorized" })
  }

  const experimentFile = await prisma.experimentFile.findFirst({
    where: {
      id: experimentFileId,
    },
    include: {
      experimentSection: {
        include: {
          experiment: true,
        },
      },
    },
  })

  if (!experimentFile) {
    throw createError({ status: 404, message: "Experiment file not found" })
  }

  await authorize(event, canUpdateExperimentFile, experimentFile.experimentSection.experiment)

  const newExperimentFileContent = await readValidatedBody(event, body => experimentFileCreateSchema.parse(body))

  const newExperimentFile = await prisma.experimentFile.update({
    where: {
      id: experimentFileId,
    },
    include: {
      file: {
        include: {
          createdBy: true,
        },
      },
    },
    data: {
      description: newExperimentFileContent.description,
      file: {
        connect: {
          id: newExperimentFileContent.fileId,
        },
      },
      experimentSection: {
        connect: {
          id: newExperimentFileContent.experimentSectionId,
        },
      },
    },
  })

  return newExperimentFile.toDetail(
    newExperimentFile.file,
    newExperimentFile.file.createdBy.toDetail(),
  )
})

defineRouteMeta({
  openAPI: {
    description: "Update an experiment file",
    tags: ["Experiment Files"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              description: { type: "string" },
            },
            required: ["description", "fileId", "experimentSectionId"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The experiment file has been updated",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                description: { type: "string" },
                file: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    path: { type: "string" },
                    mimeType: { type: "string" },
                    createdBy: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "Experiment file not found",
      },
    },
  },
})
