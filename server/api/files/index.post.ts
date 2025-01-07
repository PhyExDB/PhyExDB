import type { File } from "~~/shared/types"
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
        mimeType: file.type,
        createdBy: { connect: { id: user.id } },
      },
    })

    newFiles.push(dbFile.toDetail(user))
  }

  return newFiles
})

defineRouteMeta({
  openAPI: {
    description: "Upload one or multiple files",
    tags: ["Files"],
    requestBody: {
      content: {
        // TODO: I think this is wrong, since the file is not a JSON object
        "application/json": {
          schema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    content: { type: "string" },
                    size: { type: "string" },
                    type: { type: "string" },
                    lastModified: { type: "string" },
                  },
                  required: ["name", "content", "size", "type", "lastModified"],
                },
              },
            },
            required: ["files"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "The file has been uploaded",
      },
    },
  },
})
