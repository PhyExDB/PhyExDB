import { fileAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"
import { getIdPrismaWhereClause } from "~~/server/utils/utils"
import { deleteFile } from "~~/server/utils/files"

export default defineEventHandler(async (event) => {
  const where = getIdPrismaWhereClause(event)

  const file = await prisma.file.findFirst({
    where,
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

  deleteFile(filePath)

  await prisma.file.delete({
    where,
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
