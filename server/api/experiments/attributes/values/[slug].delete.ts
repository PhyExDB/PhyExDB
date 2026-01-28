import { experimentAttributeValueAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"
import { getSlugOrIdPrismaWhereClause } from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  await authorize(event, experimentAttributeValueAbilities.delete)

  const whereClause = getSlugOrIdPrismaWhereClause(event)

  await prismaRecordNotFoundTo404(async () =>
    await prisma.experimentAttributeValue.delete({
      where: whereClause,
    }),
  )

  setResponseStatus(event, 204)
  return null
})

defineRouteMeta({
  openAPI: {
    description: "Delete an experiment attribute value",
    tags: ["ExperimentAttributeValues"],
    parameters: [
      {
        name: "slug",
        in: "path",
        required: true,
        description: "The ID or slug of the experiment attribute value",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    responses: {
      204: {
        description: "Attribute value deleted",
      },
      401: {
        description: "Not logged in",
      },
      404: {
        description: "Attribute value not found",
      },
    },
  },
})
