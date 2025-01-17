import { experimentFileCreateSchema } from "~~/shared/types"
import { canCreateExperimentFile } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    throw createError({ status: 401, message: "Unauthorized" })
  }

  const newExperimentFileContent = await readValidatedBody(event, body => experimentFileCreateSchema.parse(body))

  const experimentSectionContent = await prisma.experimentSectionContent.findFirst({
    where: {
      id: newExperimentFileContent.experimentSectionId,
    },
    include: {
      experiment: true,
    },
  })

  if (!experimentSectionContent) {
    throw createError({ status: 404, message: "Experiment section not found" })
  }

  const file = await prisma.file.findFirst({
    where: {
      id: newExperimentFileContent.fileId,
    },
  })

  if (!file) {
    throw createError({ status: 404, message: "File not found" })
  }

  await authorize(event, canCreateExperimentFile, experimentSectionContent.experiment)

  const newExperimentFile = await prisma.experimentFile.create({
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

  setResponseStatus(event, 201)
  return newExperimentFile as ExperimentFileDetail
})

defineRouteMeta({
  openAPI: {
    description: "Create a new experiment file",
    tags: ["Experiment Files"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              description: { type: "string" },
              fileId: { type: "string", format: "uuid" },
              experimentSectionId: { type: "string", format: "uuid" },
            },
            required: ["description", "fileId", "experimentSectionId"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The experiment file has been created",
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
        description: "Experiment section not found",
      },
    },
  },
})
