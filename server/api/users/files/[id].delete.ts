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
    description: "Deletes a user file",
    tags: ["User Files"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "The user file ID",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
    ],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              fileId: { type: "string", format: "uuid" },
            },
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
