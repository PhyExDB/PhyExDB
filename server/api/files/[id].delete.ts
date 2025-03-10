import { fileAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"
import { getIdPrismaWhereClause } from "~~/server/utils/prisma"
import { myDeleteFile } from "~~/server/utils/files"

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

  const referencedExperiments = await prisma.experiment.count({
    where: {
      previewImageId: file.id,
    },
  })

  if (referencedExperiments) {
    return setResponseStatus(event, 204)
  }

  const runtimeConfig = useRuntimeConfig()
  const filePath = `${runtimeConfig.fileMount}/${file.path}`

  try {
    await prisma.file.delete({
      where,
    })
    myDeleteFile(filePath)
  } catch {
    // don't delete file because there are multiple references to it
  }

  return setResponseStatus(event, 204)
})

defineRouteMeta({
  openAPI: {
    description: "Delete a file",
    tags: ["Files"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "The ID of the file",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
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
