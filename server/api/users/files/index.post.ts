import type { UserFileDetail } from "~~/shared/types"
import { userFileCreateSchema } from "~~/shared/types"
import { userFileAbilities } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const newUserFileContent = await readValidatedBody(event, body => userFileCreateSchema.parse(body))

  const user = await getUser(event)
  if (!user) {
    throw createError({ status: 401, message: "Unauthorized" })
  }

  const file = await prisma.file.findFirst({
    where: {
      id: newUserFileContent.fileId,
    },
  })

  if (!file) {
    throw createError({ status: 404, message: "File not found" })
  }

  await authorize(event, userFileAbilities.post, file)

  const newUserFile = await prisma.userFile.create({
    include: {
      file: {
        include: {
          createdBy: true,
        },
      },
    },
    data: {
      file: {
        connect: {
          id: newUserFileContent.fileId,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  })

  return newUserFile as UserFileDetail
})

defineRouteMeta({
  openAPI: {
    description: "Create a new experiment file",
    tags: ["User Files"],
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
      200: {
        description: "The experiment file has been created",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
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
