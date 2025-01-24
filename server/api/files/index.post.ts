import type { File, FileDetail } from "~~/shared/types"
import { canCreateFile } from "~~/shared/utils/abilities"

const relativeFileUploadDirectory = "/uploads"

export default defineEventHandler(async (event) => {
  const { files } = await readBody<{ files: File[] }>(event)
  const user = await getUser(event)
  if (!user) {
    throw createError({ status: 401, message: "Unauthorized" })
  }
  await authorize(event, canCreateFile)

  const newFiles: FileDetail[] = []

  for (const file of files) {
    const newRelativeFileLocation = await storeFileLocally(
      file,
      12,
      relativeFileUploadDirectory,
    )
    const newFileLocation = `${relativeFileUploadDirectory}/${newRelativeFileLocation}`
    const dbFile = await prisma.file.create({
      data: {
        path: newFileLocation,
        originalName: file.name,
        mimeType: file.type,
        createdBy: { connect: { id: user.id } },
      },
      include: {
        createdBy: true,
      },
    })

    newFiles.push(dbFile as FileDetail)
  }

  setResponseStatus(event, 201)
  return newFiles
})

defineRouteMeta({
  openAPI: {
    description: "Upload one or multiple files",
    tags: ["Files"],
    requestBody: {
      content: {
        "": {
          schema: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
    responses: {
      200: {
        description: "The file has been uploaded",
      },
      401: {
        description: "Unauthorized",
      },
    },
  },
})
