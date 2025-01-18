import fs from "fs"
import { fileAbilities } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  const fileId = getRouterParam(event, "id")

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
    },
    include: {
      createdBy: true,
    },
  })

  if (!file) {
    throw createError({ status: 404, message: "File not found" })
  }

  await authorize(event, fileAbilities.delete, file)

  const runtimeConfig = useRuntimeConfig()
  const filePath = `${runtimeConfig.fileMount}/${file.path}`

  try {
    fs.unlinkSync(filePath)
  } catch (error) {
    logger.error("Failed to delete file from filesystem", { error })
    throw createError({ status: 500, message: "Failed to delete file from filesystem" })
  }

  await prisma.file.delete({
    where: {
      id: fileId,
    },
  })

  return setResponseStatus(event, 204)
})

defineRouteMeta({
  openAPI: {
    description: "Delete a file",
    tags: ["Files"],
    responses: {
      204: {
        description: "The file has been deleted.",
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
