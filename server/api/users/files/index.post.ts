import type { UserFileDetail } from "~~/shared/types"
import { userFileCreateSchema } from "~~/shared/types"
import { userFileAbilities } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const newUserFileContent = await readValidatedBody(event, body => userFileCreateSchema.parse(body))

  const user = await getUserOrThrowError(event)

  const file = await prisma.file.findFirst({
    where: {
      id: newUserFileContent.fileId,
    },
  })

  if (!file) {
    throw createError({ status: 404, message: "File not found" })
  }

  await authorizeUser(event, userFileAbilities.post, file)

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

  setResponseStatus(event, 201)
  return newUserFile as UserFileDetail
})

defineRouteMeta({
  openAPI: {
    description: "Converts regular file to a user file",
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
      201: {
        description: "The user file has been created",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                fileId: { type: "string", format: "uuid" },
                userId: { type: "string", format: "uuid" },
                file: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    originalName: { type: "string" },
                    path: { type: "string" },
                    mimeType: { type: "string" },
                    startPageId: { type: "string", format: "uuid" },
                    createdById: { type: "string", format: "uuid" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                    createdBy: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        role: { type: "string", enum: ["USER", "MODERATOR", "ADMIN"] },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                        name: { type: "string" },
                        email: { type: "string" },
                        emailVerified: { type: "boolean" },
                        image: { type: "object" },
                        banned: { type: "boolean" },
                        banReason: { type: "string" },
                        banExpires: { type: "string", format: "date-time" },
                      },
                    },
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
