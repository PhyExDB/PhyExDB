import { canDeleteUserFile } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const userFileId = getRouterParam(event, "id")

  const user = await getUser(event)
  if (!user) {
    throw createError({ status: 401, message: "Unauthorized" })
  }

  const userFile = await prisma.userFile.findFirst({
    where: {
      id: userFileId,
    },
    include: {
      user: true,
    },
  })

  if (!userFile) {
    throw createError({ status: 404, message: "User file not found" })
  }

  await authorize(event, canDeleteUserFile, userFile)

  await prisma.userFile.delete({
    where: {
      id: userFileId,
    },
  })

  return setResponseStatus(event, 204)
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
              fileId: { type: "string", format: "uuid" },
            },
            required: ["fileId"],
          },
        },
      },
    },
    responses: {
      204: {
        description: "The user file has been deleted.",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "File not found",
      },
    },
  },
})
