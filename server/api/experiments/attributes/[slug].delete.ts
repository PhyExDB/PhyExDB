import { experimentAttributeAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"
import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeAbilities.delete)

  const whereClause = getSlugOrIdPrismaWhereClause(event)

  await prismaRecordNotFoundTo404(async () =>
    await prisma.experimentAttribute.delete({
      where: whereClause,
    }),
  )

  setResponseStatus(event, 204)
  return null
})

defineRouteMeta({
  openAPI: {
    description: "Delete an experiment attribute",
    tags: ["ExperimentAttribute"],
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "The ID or slug of the experiment attribute",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    responses: {
      204: {
        description: "Attribute deleted",
      },
      401: {
        description: "Not logged in",
      },
      404: {
        description: "Attribute not found",
      },
    },
  },
})
