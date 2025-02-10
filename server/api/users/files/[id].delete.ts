import { userFileAbilities } from "~~/shared/utils/abilities"

export default defineEventHandler(async (event) => {
  await getUserOrThrowError(event)

  const where = getIdPrismaWhereClause(event)

  const userFile = await prisma.userFile.findFirst({
    where,
    include: {
      user: true,
    },
  })

  if (!userFile) {
    throw createError({ status: 404, message: "User file not found" })
  }

  await authorizeUser(event, userFileAbilities.delete, userFile)

  const deletedUserFile = await prisma.userFile.delete({
    where,
  })

  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  // Using event.$fetch forwards headers like Authorization
  // @ts-expect-error: Excessive stack depth
  return await event.$fetch("/api/files/" + deletedUserFile.fileId, {
    method: "DELETE",
  }) satisfies void
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
      204: {
        description: "The user file has been deleted.",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "User file not found",
      },
    },
  },
})
