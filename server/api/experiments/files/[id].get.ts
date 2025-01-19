import type { ExperimentFileDetail } from "~~/shared/types"

import { experimentFileAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    throw createError({ status: 401, message: "Unauthorized" })
  }

  const experimentFileId = getRouterParam(event, "id")

  const result = await prisma.experimentFile.findFirst({
    where: {
      id: experimentFileId,
    },
    include: {
      experimentSection: {
        include: {
          experiment: {
            select: {
              id: true,
              slug: true,
              name: true,
              userId: true,
              status: true,
              duration: true,
              ...experimentIncludeForToList,
            },
          },
        },
      },
      file: {
        include: {
          createdBy: true,
        },
      },
    },
  })

  if (!result) {
    throw createError({ status: 404, message: "Experiment file not found" })
  }

  await authorize(event, experimentFileAbilities.get, result)

  return result as ExperimentFileDetail
})

defineRouteMeta({
  openAPI: {
    description: "Update an experiment file",
    tags: ["Experiment Files"],
    responses: {
      200: {
        description: "The experiment file with the given id",
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
