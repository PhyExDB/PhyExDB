import { authorize } from "~~/server/utils/authorization"
import { userAbilities } from "~~/shared/utils/abilities"
import { getIdPrismaWhereClause } from "~~/server/utils/prisma"

/**
 * POST /api/users/:id/ban
 *
 * Secure backend endpont for banning a user
 *
 * Bans a user by setting `banned = true`
 * Executed with admin privileges
 */
export default defineEventHandler(async (event) => {
  // Admins only
  await authorize(event, userAbilities.put)

  const where = getIdPrismaWhereClause(event)

  const target = await prisma.user.findUnique({ where })
  if (!target) {
    throw createError({ status: 404, message: "User not found" })
  }

  // Guard: already banned
  if (target.banned) {
    return {
      id: target.id,
      banned: true,
    }
  }

  const updated = await prisma.user.update({
    where,
    data: { banned: true },
  })

  return {
    id: updated.id,
    banned: true,
  }
})

/**
 * Route metadata for OpenAPI
 */
export const routeMeta = defineRouteMeta({
  openAPI: {
    description: "Ban a user by ID. Only admins can perform this action.",
    tags: ["User"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "The ID of the user",
        schema: { type: "string", format: "uuid" },
      },
    ],
    responses: {
      200: {
        description: "User banned successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                banned: { type: "boolean" },
              },
              required: ["id", "banned"],
            },
          },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "User not found" },
    },
  },
})

