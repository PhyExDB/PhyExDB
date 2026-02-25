import { authorize } from "~~/server/utils/authorization"
import { userAbilities } from "~~/shared/utils/abilities"
import { getIdPrismaWhereClause } from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  // Admins only
  await authorize(event, userAbilities.put)
  const where = getIdPrismaWhereClause(event)
  const body = await readBody<{ role?: string }>(event)
  const newRole = body?.role as UserRole | undefined
  const allowedRoles: UserRole[] = ["USER", "MODERATOR", "ADMIN"]

  if (!newRole || !allowedRoles.includes(newRole)) {
    throw createError({ status: 400, message: "Invalid role" })
  }

  const target = await prisma.user.findUnique({ where })
  if (!target) {
    throw createError({ status: 404, message: "User not found" })
  }

  // Guard: prevent demoting the last remaining admin
  if (target.role === "ADMIN" && newRole !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount === 1) {
      throw createError({ status: 400, message: "Cannot demote the last admin user" })
    }
  }

  const updated = await prisma.user.update({ where, data: { role: newRole } })

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role as UserRole,
  }
})

defineRouteMeta({
  openAPI: {
    description: "Update a user's role",
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
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { role: { type: "string", enum: ["USER", "MODERATOR", "ADMIN"] } },
            required: ["role"],
          },
        },
      },
    },
    responses: {
      200: { description: "Role updated" },
      400: { description: "Invalid input or last admin demotion forbidden" },
      401: { description: "Unauthorized" },
      404: { description: "User not found" },
    },
  },
})
